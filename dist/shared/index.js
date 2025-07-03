"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRole = exports.TransactionType = exports.BusinessType = exports.BusinessSize = void 0;
var BusinessSize;
(function (BusinessSize) {
    BusinessSize["SMALL"] = "1-5 sucursales";
    BusinessSize["MEDIUM"] = "5-10 sucursales";
    BusinessSize["LARGE"] = "+10 sucursales";
})(BusinessSize || (exports.BusinessSize = BusinessSize = {}));
var BusinessType;
(function (BusinessType) {
    BusinessType["CAFETERIA"] = "Cafeteria";
    BusinessType["RESTAURANT"] = "Restaurant";
    BusinessType["PELUQUERIA"] = "Peluqueria";
    BusinessType["MANICURA"] = "Manicura";
    BusinessType["OTRO"] = "Otro";
})(BusinessType || (exports.BusinessType = BusinessType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["ACUMULATION"] = "acumulacion";
    TransactionType["EXCHANGE"] = "canje";
    TransactionType["REWARD"] = "bonificacion";
    TransactionType["PENALTY"] = "penalizacion";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var AdminRole;
(function (AdminRole) {
    AdminRole["OWNER"] = "propietario";
    AdminRole["EMPLOYEE"] = "empleado";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
//# sourceMappingURL=index.js.map