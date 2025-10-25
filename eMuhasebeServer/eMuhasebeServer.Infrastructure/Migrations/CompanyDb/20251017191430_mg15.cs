using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace eMuhasebeServer.Infrastructure.Migrations.CompanyDb
{
    /// <inheritdoc />
    public partial class mg15 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CashRegisterDetailOppositeId",
                table: "CashRegisterDetails",
                newName: "bankDetailId");

            migrationBuilder.AddColumn<Guid>(
                name: "CashRegisterDetailId",
                table: "CashRegisterDetails",
                type: "uniqueidentifier",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CashRegisterDetailId",
                table: "CashRegisterDetails");

            migrationBuilder.RenameColumn(
                name: "bankDetailId",
                table: "CashRegisterDetails",
                newName: "CashRegisterDetailOppositeId");
        }
    }
}
