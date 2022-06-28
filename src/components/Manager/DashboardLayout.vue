<template>
    <div class="dashboard">
        <v-navigation-drawer v-model="drawer" class="fullheight" width="256" app>
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title class="title">WELCOME</v-list-item-title>
                    <v-list-item-subtitle>MANAGER</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>

            <v-divider></v-divider>
            <v-list dense nav>
                <v-list-item v-for="item in items" :key="item.title" link tag="router-link" :to="item.to">
                    <v-list-item-content>
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-app-bar app fixed height="75px">
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
            <VSpacer />
            <v-toolbar-items>
                <v-btn text router @click="logout"><v-icon>mdi-power</v-icon></v-btn>
            </v-toolbar-items>
        </v-app-bar>
        <div class="fullheight pa-5">
            <router-view></router-view>
        </div>
        <v-snackbar v-model="snackbar" :color="color" timeout="2000" bottom> {{ error_message }} </v-snackbar>
    </div>
</template>

<script>
export default{
    name: "ManagerDashboard",
    data(){
        return{
            load: false,
            snackbar: false,
            error_message: "",
            color: "",
            drawer: true,
            items:[
                { title: "Dashboard", to: "/manager_dashboard" },
                { title: "Promo", to: "/manager_promo" },
                { title: "Jadwal Pegawai", to: "/manager_jadwal" },
                { title: "Detail Jadwal Pegawai", to: "/manager_detail_jadwal" },
            ],
        };
    },
     methods: {
        logout() {
            var url = this.$api + "/logoutpegawai";
            this.load = true;
            this.$http
            .get(url)
            .then((response) => {
            this.error_message = response.data.message;
            this.color = "green";
            this.snackbar = true;
            this.load = false;
            alert(response.data.message);
            localStorage.removeItem("id");
            localStorage.removeItem("user");
            this.$router.push({
                path: "/",
            });
            })
            .catch((error) => {
            this.error_message = error.response.data.message;
            this.color = "red";
            this.snackbar = true;
            this.load = false;
            alert(error.response.data.message);
            });
        },
    }
};
</script>

<style scoped>
.fullheight {
    min-height: 100vh !important;
}

.router {
    text-decoration: none;
    color: black;
}
</style>