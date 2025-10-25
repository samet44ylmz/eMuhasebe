import { CompanyModel } from "./company.model";

export class CompanyUsersModel{
    appUserId: string = "";
    companyId: string = "";
    company: CompanyModel = new CompanyModel();
}