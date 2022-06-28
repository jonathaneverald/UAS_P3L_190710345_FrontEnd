<template>
    <v-main class="customer">
        <h3 class="text-h3 font-weight-medium mb-5">Customer</h3>
        <v-card persistent min-width="600px" elevation="8">
        <v-card-title class="backgroundhead">
          <span class="headline"><b>Profil</b></span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-text-field v-model="form.format_id_customer" label="ID Customer" readonly></v-text-field>
            <v-text-field v-model="form.nama_customer" label="Nama Customer" readonly></v-text-field>
            <v-text-field v-model="form.alamat_customer" label="Alamat Customer" readonly></v-text-field>
            <v-text-field v-model="form.tanggal_lahir" label="Tanggal Lahir" readonly></v-text-field>
            <v-text-field v-model="form.jenis_kelamin" label="Jenis Kelamin" readonly></v-text-field>
            <v-text-field v-model="form.email" label="Email" readonly></v-text-field>
            <v-text-field v-model="form.no_telp" label="No Telp" readonly></v-text-field>
            <v-text-field v-model="form.tanda_pengenal" label="Tanda Pengenal" readonly></v-text-field>
            <p class="text-left" style="margin: auto; font-size: 9pt">SIM</p>
            <v-img :src="preview_sim" class="mb-6" width="200"></v-img>
            <p class="text-left" style="margin: auto; font-size: 9pt">Foto KTP atau Kartu Pelajar</p>
            <v-img :src="preview_dokumen_persyaratan" class="mb-6" width="200"></v-img>
            <v-text-field v-model="form.status_dokumen" label="Status Dokumen" readonly></v-text-field>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="open"> EDIT PROFIL </v-btn>
        </v-card-actions>
      </v-card>
    <v-dialog v-model="dialog" persistent width="600px">
      <v-card>
        <v-card-title>
          <span class="headLine">EDIT PROFIL</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-text-field v-model="form.nama_customer" label="Nama Customer" required></v-text-field>
            <v-textarea v-model="form.alamat_customer" label="Alamat Customer" required></v-textarea>
            <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px" min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="form.tanggal_lahir" label="Tanggal Lahir" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="form.tanggal_lahir" no-title @input="menu = false"></v-date-picker>
            </v-menu>
            <v-select v-model="form.jenis_kelamin" :items="['Pria', 'Wanita']" label="Jenis Kelamin" required></v-select>
            <v-text-field v-model="form.email" label="Email" required></v-text-field>
            <v-text-field v-model="form.no_telp" label="No Telp" required></v-text-field>
            <v-select v-model="form.tanda_pengenal" :items="['KTP', 'Kartu Pelajar']" label="Tanda Pengenal" required></v-select>
            <v-file-input v-model="form.foto_sim" accept="image/*" show-size label="SIM" @change="sim" />
            <v-img :src="preview_sim" class="mb-6" v-if="preview_sim" width="200"></v-img>
            <v-file-input v-model="form.dokumen_persyaratan" accept="image/*" show-size label="Foto KTP atau Kartu Pelajar" @change="dokumen_persyaratan" />
            <v-img :src="preview_dokumen_persyaratan" class="mb-6" v-if="preview_dokumen_persyaratan" width="200"></v-img>
            <v-text-field v-model="form.password" label="Password Baru" type="password" hint="Bisa Dikosongkan Jika Tidak Mau Diganti" persistent-hint></v-text-field>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="cancel"> Cancel </v-btn>
          <v-btn color="blue darken-1" text @click="edit"> Edit </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :color="color" timeout="2000" bottom> {{ error_message }} </v-snackbar>
    </v-main>
</template>

<script>
export default {
  name: "CustomerProfil",
  data() {
    return {
      load: false,
      snackbar: false,
      error_message: "",
      color: "",
      dialog: false,
      preview_sim: "",
      preview_dokumen_persyaratan: "",
      menu: false,
      form: {
        nama_customer: null,
        alamat_customer: null,
        tanggal_lahir: null,
        jenis_kelamin: null,
        email: null,
        no_telp: null,
        tanda_pengenal: null,
        foto_sim: null,
        dokumen_persyaratan: null,
        status_dokumen: null,
        password: null,
      },
    };
  },
  methods: {
    readData() {
      var url = this.$api + "/customer/" + localStorage.getItem("id");
      this.$http.get(url).then((response) => {
        var year, temp;
        this.form.format_id_customer = response.data.customer.format_id_customer;
        this.form.nama_customer = response.data.customer.nama_customer;
        this.form.alamat_customer = response.data.customer.alamat_customer;
        this.date = response.data.customer.tanggal_lahir.split("-");
        year = Number(this.date[0]);
        if (year < 40) year = year + 2000;
        else year = year + 1900;
        temp = year.toString() + "-" + this.date[1] + "-" + this.date[2];
        this.form.tanggal_lahir = temp;
        this.form.jenis_kelamin = response.data.customer.jenis_kelamin;
        this.form.email = response.data.customer.email;
        this.form.no_telp = response.data.customer.no_telp;
        this.form.tanda_pengenal = response.data.customer.tanda_pengenal;
        fetch(process.env.VUE_APP_AJAX_BASE_URL + "foto_sim/" + response.data.customer.foto_sim)
          .then((response) => response.blob())
          .then((imageBlob) => {
            this.form.foto_sim = imageBlob;
            this.form.foto_sim.name = response.data.customer.foto_sim;
          });
        fetch(process.env.VUE_APP_AJAX_BASE_URL + "dokumen_persyaratan/" + response.data.customer.dokumen_persyaratan)
          .then((response) => response.blob())
          .then((imageBlob) => {
            this.form.dokumen_persyaratan = imageBlob;
            this.form.dokumen_persyaratan.name = response.data.customer.dokumen_persyaratan;
          });
        this.preview_sim = process.env.VUE_APP_AJAX_BASE_URL + "foto_sim/" + response.data.customer.foto_sim;
        this.preview_dokumen_persyaratan = process.env.VUE_APP_AJAX_BASE_URL + "dokumen_persyaratan/" + response.data.customer.dokumen_persyaratan;
        this.form.status_dokumen = response.data.customer.status_dokumen;
      });
    },
    cancel() {
      this.readData();
      this.dialog = false;
    },
    open() {
      this.dialog = true;
    },
    edit() {
      var year, temp;
      const formData = new FormData();
      temp = this.form.tanggal_lahir;
      if (this.form.tanggal_lahir != null) {
        this.date = this.form.tanggal_lahir.split("-");
        year = this.date[0].substr(2, 3);
        temp = year + "-" + this.date[1] + "-" + this.date[2];
        formData.append("tanggal_lahir", temp);
      } else formData.append("tanggal_lahir", "");
      if (this.form.nama_customer != null) formData.append("nama_customer", this.form.nama_customer);
      else formData.append("nama_customer", "");
      if (this.form.alamat_customer != null) formData.append("alamat_customer", this.form.alamat_customer);
      else formData.append("alamat_customer", "");
      if (this.form.jenis_kelamin != null) formData.append("jenis_kelamin", this.form.jenis_kelamin);
      else formData.append("jenis_kelamin", "");
      if (this.form.email != null) formData.append("email", this.form.email);
      else formData.append("email", "");
      if (this.form.no_telp != null) formData.append("no_telp", this.form.no_telp);
      else formData.append("no_telp", "");
      if (this.form.tanda_pengenal != null) formData.append("tanda_pengenal", this.form.tanda_pengenal);
      else formData.append("tanda_pengenal", "");
      if (this.form.foto_sim != null) formData.append("foto_sim", this.form.foto_sim);
      else formData.append("foto_sim", "");
      if (this.form.dokumen_persyaratan != null) formData.append("dokumen_persyaratan", this.form.dokumen_persyaratan);
      else formData.append("dokumen_persyaratan", "");
      if (this.form.status_dokumen != null) formData.append("status_dokumen", this.form.status_dokumen);
      else formData.append("status_dokumen", "");
      if (this.form.password != null) formData.append("password", this.form.password);
      else formData.append("password", "");

      var url = this.$api + "/customer/" + localStorage.getItem("id");
      this.load = true;
      this.$http
        .post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          this.error_message = response.data.message;
          this.color = "green";
          this.snackbar = true;
          this.load = false;
          this.dialog = false;
        })
        .catch((error) => {
          this.error_message = error.response.data.message;
          this.color = "red";
          this.snackbar = true;
          this.load = false;
        });
    },
    sim(image) {
      if (!image) {
        this.preview_sim = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.preview_sim = e.target.result;
      };
      reader.readAsDataURL(image);
    },
    dokumen_persyaratan(image) {
      if (!image) {
        this.preview_dokumen_persyaratan = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.preview_dokumen_persyaratan = e.target.result;
      };
      reader.readAsDataURL(image);
    },
  },
  mounted() {
    this.readData();
  },
};
</script>