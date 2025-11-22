using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace eMuhasebeServer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class mg18_UpdateGiderCurrencyTypeDefaults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update any existing rows with 0 value to 1 (TL)
            migrationBuilder.Sql(
                "UPDATE [Giderler] SET [GiderCurrencyType] = 1 WHERE [GiderCurrencyType] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No down action needed as this is just data correction
        }
    }
}
