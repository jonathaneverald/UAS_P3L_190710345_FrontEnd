<template>
    <main>
        <v-container fluid fill-height class="posisinya">
            <v-layout flex align-center justify-center>
                <v-flex xs12 sm6 elevation-6>
                    <v-toolbar class="grey darken-3">
                        <v-toolbar-title class="grey--text">
                            <h1>Selamat datang di Atma Rental</h1>
                        </v-toolbar-title>
                    </v-toolbar>
                    <v-card>
                        <v-card-text class="pt-4">
                            <div>
                                <v-form v-model="valid" ref="form">
                                    <v-select v-model="role" :rules="roleRules" :items="['Pegawai', 'Customer']" label="Masuk Sebagai"></v-select>
                                    <v-text-field label="E-mail" v-model="email" :rules="emailRules" required></v-text-field>
                                    <v-text-field label="Password" v-model="password" type="password" min="8" :rules="passwordRules" counter required></v-text-field>
                                    <v-card-actions class="mt-3">
                                    <v-row justify="end">
                                        <router-link :to="{ path: '/register' }" style="text-decoration: none; color: white">
                                            <v-btn class="grey darken-3 white--text"> Register </v-btn>
                                        </router-link>
                                        <v-spacer></v-spacer>
                                        <v-btn class="mr-2" @click="login" :class="{ 'grey darken-1 white--text': valid, disabled: !valid }">Go</v-btn>
                                        <v-btn @click="clear" class="grey darken-3 white--text">Clear</v-btn>
                                    </v-row>
                                </v-card-actions>
                                </v-form>
                            </div>
                        </v-card-text>
                    </v-card>
                    <v-snackbar v-model="snackbar" :color="color" timeout="2000" bottom>{{ error_message }}</v-snackbar>
                </v-flex>      
            </v-layout>
        </v-container>
    </main>
</template>


<script>
export default {
  name: "UserLogin",
  data() {
    return {
      load: false,
      snackbar: false,
      error_message: "",
      color: "",
      valid: false,
      role: "",
      roleRules: [(v) => !!v || "Bagian ini tidak boleh kosong :("],
      password: "",
      passwordRules: [(v) => !!v || "Password tidak boleh kosong :("],
      email: "",
      emailRules: [(v) => !!v || "E-mail tidak boleh kosong :("],
    };
  },
  methods: {
    login() {
      if (this.$refs.form.validate()) {
        //cek validasi data yang terkirim
        this.load = true;
        let url = null;
        if (this.role == "Pegawai") 
            url = this.$api + "/loginpegawai";
        else 
            url = this.$api + "/logincustomer";
        this.$http
          .post(url, {
            email: this.email,
            password: this.password,
          })
          .then((response) => {
            //simpan data id user yang diinput
            this.error_message = response.data.message;
            this.color = "green";
            this.snackbar = true;
            this.load = false;
            if (this.role == "Pegawai") { 
              localStorage.setItem("role", "pegawai");
              let temp = response.data.pegawai;
              let id = temp.map((v) => v.id_pegawai);
              let temp1 = temp.map((v) => v.role.jabatan);
              localStorage.setItem("id", id[0]);
              let jabatan = temp1[0];
              
              if (jabatan == "Admin") {
                alert("Selamat Datang Admin");
                this.$router.push({
                   path: "/admin_dashboard",
                });
              } else if (jabatan == "Manager") {
                alert("Selamat Datang Manager");
                this.$router.push({
                  name: "Manager | Dashboard",
                });
              } else if (jabatan == "Customer Service") {
                alert("Selamat Datang Customer Service");
                this.$router.push({
                  name: "CustomerService | Dashboard",
                });
              }
            } else {
              localStorage.setItem("role", "customer");
              let temp = response.data.customer;
              let id = temp.map((v) => v.id_customer);
              localStorage.setItem("id", id[0]);
              alert("Selamat Datang Customer");
              this.$router.push({
                  name: "CustomerAjr | Dashboard",
              });
            }
            this.clear();
          })
          .catch((error) => {
            this.error_message = error.response.data.message;
            this.color = "red";
            this.snackbar = true;
            this.load = false;
          });
      }
    },
    clear() {
      this.$refs.form.reset(); // clear form login
    },
  },
};
</script>