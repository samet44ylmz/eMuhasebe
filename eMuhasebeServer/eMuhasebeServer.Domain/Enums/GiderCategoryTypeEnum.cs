using Ardalis.SmartEnum;

namespace eMuhasebeServer.Domain.Enums;

public sealed class GiderCategoryTypeEnum : SmartEnum<GiderCategoryTypeEnum>
{
    public static readonly GiderCategoryTypeEnum Genel = new("Genel", 1);
    public static readonly GiderCategoryTypeEnum Ofis = new("Ofis", 2);
    public static readonly GiderCategoryTypeEnum Ulaşım = new("Ulaşım", 3);
    public static readonly GiderCategoryTypeEnum Yemek = new("Yemek", 4);
    public static readonly GiderCategoryTypeEnum Malzeme = new("Malzeme", 5);
    public static readonly GiderCategoryTypeEnum Diğer = new("Diğer", 6);


    public GiderCategoryTypeEnum(string name, int value) : base(name, value)
    {
    }
}
