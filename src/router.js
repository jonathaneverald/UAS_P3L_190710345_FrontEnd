import VueRouter from "vue-router";
import Vue from "vue";

Vue.use(VueRouter);

function importComponent(path){
    return () => import(`./components/${path}.vue`);
}

const router = new VueRouter({
    mode: "history",
    routes: [
        {
            path: "/admin",
            name: "Admin",
            meta: { title: "Admin" },
            component: importComponent("Admin/DashboardLayout"),
            children:[
                //Dashboard
                {
                    path: "/admin_dashboard",
                    name: "Admin | Dashboard",
                    meta: { title: "Admin Dashboard" },
                    component: importComponent("Admin/AdminDashboard"),
                },
                // Role
                {
                    path: "/admin_role",
                    name: "Admin | Role",
                    meta: { title: "Admin Role" },
                    component: importComponent("Admin/AdminRole"),
                },
                // Mobil
                {
                    path: "/admin_mobil",
                    name: "Admin | Mobil",
                    meta: { title: "Admin Mobil" },
                    component: importComponent("Admin/AdminMobil"),
                },
                // Pemilik Mobil
                {
                    path: "/admin_pemilik_mobil",
                    name: "Admin | Pemilik_Mobil",
                    meta: { title: "Admin Pemilik Mobil" },
                    component: importComponent("Admin/AdminPemilikMobil"),
                },
                // Driver
                {
                    path: "/admin_driver",
                    name: "Admin | Driver",
                    meta: { title: "Admin Driver" },
                    component: importComponent("Admin/AdminDriver"),
                },
                //Pegawai
                {
                    path: "/admin_pegawai",
                    name: "Admin | Pegawai",
                    meta: { title: "Admin Pegawai" },
                    component: importComponent("Admin/AdminPegawai"),
                },
            ],
        },

        {
            path: "/manager",
            name: "Manager",
            meta: { title: "Manager" },
            component: importComponent("Manager/DashboardLayout"),
            children:[
                //Dashboard
                {
                    path: "/manager_dashboard",
                    name: "Manager | Dashboard",
                    meta: { title: "Manager Dashboard" },
                    component: importComponent("Manager/ManagerDashboard"),
                },
                // Promo
                {
                    path: "/manager_promo",
                    name: "Manager | Promo",
                    meta: { title: "Manager Promo" },
                    component: importComponent("Manager/ManagerPromo"),
                },
                // Jadwal
                {
                    path: "/manager_jadwal",
                    name: "Manager | Jadwal",
                    meta: { title: "Manager Jadwal" },
                    component: importComponent("Manager/ManagerJadwal"),
                },
                // Detail Jadwal
                {
                    path: "/manager_detail_jadwal",
                    name: "Manager | DetailJadwal",
                    meta: { title: "Manager Detail Jadwal" },
                    component: importComponent("Manager/ManagerDetailJadwal"),
                },
            ],
        },

        {
            path: "/customerservice",
            name: "CustomerService",
            meta: { title: "Customer Service" },
            component: importComponent("CustomerService/DashboardLayout"),
            children:[
                //Dashboard
                {
                    path: "/customerservice_dashboard",
                    name: "CustomerService | Dashboard",
                    meta: { title: "Customer Service Dashboard" },
                    component: importComponent("CustomerService/CustomerServiceDashboard"),
                },
                // Promo
                {
                    path: "/customerservice_customer",
                    name: "CustomerService | Customer",
                    meta: { title: "Customer Service Customer" },
                    component: importComponent("CustomerService/CustomerServiceCustomer"),
                },
                {
                    path: "/customerservice_transaksi",
                    name: "CustomerService | Transaksi",
                    meta: { title: "Customer Service Transaksi" },
                    component: importComponent("CustomerService/CustomerServiceTransaksi"),
                },
            ],
        },

        {
            path: "/customerajr",
            name: "CustomerAjr",
            meta: { title: "Customer AJR" },
            component: importComponent("Customer/DashboardLayout"),
            children:[
                //Dashboard
                {
                    path: "/customerajr_dashboard",
                    name: "CustomerAjr | Dashboard",
                    meta: { title: "Customer Dashboard" },
                    component: importComponent("Customer/CustomerDashboard"),
                },
                // Promo
                {
                    path: "/customerajr_profil",
                    name: "CustomerAjr | Profil",
                    meta: { title: "Customer Ajr Profil" },
                    component: importComponent("Customer/CustomerProfil"),
                },
                 // Promo
                 {
                    path: "/customerajr_transaksi",
                    name: "CustomerAjr | Transaksi",
                    meta: { title: "Customer Ajr Transaksi" },
                    component: importComponent("Customer/CustomerTransaksi"),
                },
            ],
        },

        //Login
        {
            path: "/",
            name: "UserLogin",
            meta: { title: 'Login'},
            component: importComponent("UserLogin"),
        },
        //Register
        {
            path: "/register",
            name: "UserRegister",
            meta: { title: 'Register'},
            component: importComponent("UserRegister"),
        },
        
        {
            path: '*',
            name: "Not Found",
            component: importComponent("404"),
        }
    ],
});

router.beforeEach((to, from, next) =>{
    document.title = to.meta.title;
    next();
});

export default router;