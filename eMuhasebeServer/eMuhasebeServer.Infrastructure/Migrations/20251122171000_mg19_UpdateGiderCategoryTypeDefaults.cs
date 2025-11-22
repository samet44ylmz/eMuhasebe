using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace eMuhasebeServer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class mg19_UpdateGiderCategoryTypeDefaults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update any existing rows with 0 value to 5 (Malzeme)
            migrationBuilder.Sql(
                "UPDATE [Giderler] SET [CategoryType] = 5 WHERE [CategoryType] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No down action needed as this is just data correction
        }
    }
}
