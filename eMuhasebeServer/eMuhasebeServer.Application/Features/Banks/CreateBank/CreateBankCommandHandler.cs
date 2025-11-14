using AutoMapper;
using eMuhasebeServer.Application.Services;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Repositories;
using GenericRepository;
using MediatR;
using TS.Result;

namespace eMuhasebeServer.Application.Features.Banks.CreateBank;

internal sealed class CreateBankCommandHandler(
    IBankRepository bankRepository,
    IUnitOfWork unitOfWork,
    IMapper mapper,
    ICacheService cacheService) : IRequestHandler<CreateBankCommand, Result<string>>
{
    public  async Task<Result<string>> Handle(CreateBankCommand request, CancellationToken cancellationToken)
    {
        bool isIBANExists = await bankRepository.AnyAsync(p => p.IBAN == request.IBAN, cancellationToken);
        if (isIBANExists)
        {
            return Result<string>.Failure("IBAN daha önce kaydedilmiş");
        }

        Bank bank = mapper.Map<Bank>(request);

        await bankRepository.AddAsync(bank, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        cacheService.Remove(cacheService.GetCompanyCacheKey("banks"));
        return "Banka başarıyla kaydedildi";
    }
}
