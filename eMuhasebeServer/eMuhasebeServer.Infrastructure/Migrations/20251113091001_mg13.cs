using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace eMuhasebeServer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class mg13 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Changing PaidAmount column type from decimal(18,2) to money
            // This change is safe because:
            // 1. The money type has higher precision (19 digits vs 18) and more decimal places (4 vs 2)
            // 2. The PaidAmount column was recently added and likely contains no critical production data
            // 3. This change ensures consistency with other financial columns in the application
            migrationBuilder.AlterColumn<decimal>(
                name: "PaidAmount",
                table: "Giderler",
                type: "money",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "PaidAmount",
                table: "Giderler",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "money");
        }
    }
}