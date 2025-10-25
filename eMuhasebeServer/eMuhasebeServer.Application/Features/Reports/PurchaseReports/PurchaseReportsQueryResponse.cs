namespace eMuhasebeServer.Application.Features.Reports.PurchaseReports;

public sealed record PurchaseReportsQueryResponse
{
    public List<DateOnly> Dates = new(); 
    public List<decimal> Amounts = new();
}

