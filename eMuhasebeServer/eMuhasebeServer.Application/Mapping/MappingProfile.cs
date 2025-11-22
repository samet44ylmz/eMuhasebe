﻿using AutoMapper;
using AutoMapper.Execution;
using eMuhasebeServer.Application.Features.Banks.CreateBank;
using eMuhasebeServer.Application.Features.Banks.UpdateBank;
using eMuhasebeServer.Application.Features.CashRegisters.CreateCashRegister;
using eMuhasebeServer.Application.Features.CashRegisters.UpdateCashRegister;

using eMuhasebeServer.Application.Features.Customers.CreateCustomer;
using eMuhasebeServer.Application.Features.Customers.UpdateCustomer;
using eMuhasebeServer.Application.Features.Employees.CreateEmployee;
using eMuhasebeServer.Application.Features.Employees.UpdateEmployee;
using eMuhasebeServer.Application.Features.Invoices.CreateInvoice;

using eMuhasebeServer.Domain.Dtos;
using eMuhasebeServer.Application.Features.Products.CreateProduct;
using eMuhasebeServer.Application.Features.Products.UpdateProduct;
using eMuhasebeServer.Application.Features.Users.CreateUser;
using eMuhasebeServer.Application.Features.Users.UpdateUser;
using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Enums;
using Microsoft.Extensions.Options;
using eMuhasebeServer.Application.Features.Giderler.CreateGider;
using eMuhasebeServer.Application.Features.Giderler.UpdateGider;

namespace eMuhasebeServer.Application.Mapping;

public sealed class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<CreateUserCommand, AppUser>();
        CreateMap<UpdateUserCommand, AppUser>();

       

        CreateMap<CreateCashRegisterCommand, CashRegister>().ForMember(member => member.CurrencyType, options =>
{
        options.MapFrom(map => CurrencyTypeEnum.FromValue(map.CurrencyTypeValue));
});

        CreateMap<UpdateCashRegisterCommand, CashRegister>()
            .ForMember(member => member.CurrencyType, options =>
            {
                options.MapFrom(map => CurrencyTypeEnum.FromValue(map.CurrencyTypeValue));
            });


        CreateMap<CreateBankCommand, Bank>().ForMember(member => member.CurrencyType, options =>
        {
            options.MapFrom(map => CurrencyTypeEnum.FromValue(map.CurrencyTypeValue));
        });

        CreateMap<UpdateBankCommand, Bank>()
            .ForMember(member => member.CurrencyType, options =>
            {
                options.MapFrom(map => CurrencyTypeEnum.FromValue(map.CurrencyTypeValue));
            });

        CreateMap<CreateCustomerCommand, Customer>();
        CreateMap<UpdateCustomerCommand, Customer>();
       

        CreateMap<CreateProductCommand, Product>();
        CreateMap<UpdateProductCommand, Product>();


        CreateMap<CreateInvoiceCommand, Invoice>()

        
        .ForMember(member => member.Details, options =>
        {
            options.MapFrom(map => map.Details.Select(s => new InvoiceDetail()
            {
                ProductId = s.ProductId,
                Quantity = s.Quantity,
                Price = s.Price
            }).ToList());
        })
            .ForMember(member => member.Amount, options =>
              {
                  options.MapFrom(map => map.Details.Sum(s => s.Quantity * s.Price));
              });


        CreateMap<CreateEmployeeCommand, EmployeeDetails>()
            .ForMember(member => member.WorkDays, options =>
            {
                options.MapFrom(map => map.WorkDays);
            })
            .ForMember(member => member.StartDate, options =>
            {
                options.MapFrom(map => map.StartDate);
            });
        CreateMap<UpdateEmployeeCommand, EmployeeDetails>();

        CreateMap<CreateGiderCommand, Gider>()
           .ForMember(member => member.GiderCurrencyType, options =>
           {
               options.MapFrom(map => GiderCurrencyTypeEnum.FromValue(map.GiderCurrencyTypeValue));
           });

        CreateMap<UpdateGiderCommand, Gider>()
          .ForMember(member => member.GiderCurrencyType, options =>
          {
              options.MapFrom(map => GiderCurrencyTypeEnum.FromValue(map.GiderCurrencyTypeValue));
          });


    }
}