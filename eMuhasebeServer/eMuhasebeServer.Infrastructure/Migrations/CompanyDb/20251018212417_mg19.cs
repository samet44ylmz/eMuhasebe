using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace eMuhasebeServer.Infrastructure.Migrations.CompanyDb
{
    /// <inheritdoc />
    public partial class mg19 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TaxtNumber",
                table: "Customers",
                newName: "TaxNumber");

            migrationBuilder.RenameColumn(
                name: "TaxtDepartment",
                table: "Customers",
                newName: "TaxDepartment");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TaxNumber",
                table: "Customers",
                newName: "TaxtNumber");

            migrationBuilder.RenameColumn(
                name: "TaxDepartment",
                table: "Customers",
                newName: "TaxtDepartment");
        }
    }
}
