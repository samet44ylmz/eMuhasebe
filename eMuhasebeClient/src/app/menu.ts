export class MenuModel{
    name: string = "";
    icon: string = "";
    url: string = "";
    isTitle: boolean = false;
    subMenus: MenuModel[] = [];
    showThisMenuJustAdmin: boolean = false;
}

export const Menus: MenuModel[] = [
    {
        name: "Ana Sayfa",
        icon: "fa-solid fa-home",
        url: "/",
        isTitle: false,
        subMenus: [],
        showThisMenuJustAdmin: false,
    },

    
    

    {
        name: "Admin",
        icon: "",
        url: "",
        isTitle: true,
        subMenus: [],
        showThisMenuJustAdmin: true,
    },

    {
        name: "Kullanıcılar",
        icon: "fa-solid fa-users",
        url: "/users",
        isTitle: false,
        subMenus: [],
        showThisMenuJustAdmin: true,
    },
    {
        name: "Çalışanlar",
        icon: "fa-solid fa-user-tie",
        url: "/employees",
        isTitle: false,
        subMenus: [],
        showThisMenuJustAdmin: true,
    },

    {
        name: "Kayıtlar",
        icon: "",
        url: "",
        isTitle: true,
        subMenus: [],
        showThisMenuJustAdmin: false,
    },

     {
        name: "Kasa",
        icon: "fa-solid fa-cash-register",
        url: "/cash-registers",
        isTitle: false,
        subMenus: [],
        showThisMenuJustAdmin: false,
    },
      {
        name: "Bankalar",
        icon: "fa-solid fa-bank",
        url: "/banks",
        isTitle: false,
        subMenus: [],
        showThisMenuJustAdmin: false,
    },

     {
        name: "Müşteriler",
        icon: "fa-solid fa-users",
        url: "/customers",
        isTitle: false,
        subMenus: [],
        showThisMenuJustAdmin: false,
    },
    {
        name: "Ürünler",
        icon: "fa-solid fa-boxes-stacked",
        url: "/products",
        isTitle: false,
        subMenus: [],
        showThisMenuJustAdmin: false,
    },

     {
        name: "Faturalar",
        icon: "fa-solid fa-file",
        url: "/invoices",
        isTitle: false,
        subMenus: [],
        showThisMenuJustAdmin: false,
    },

    {
        name: "Giderler",
        icon: "fa-solid fa-money-bill-wave",
        url: "/expenses",
        isTitle: false,
        subMenus: [],
        showThisMenuJustAdmin: false,
    },

    
    
    
]