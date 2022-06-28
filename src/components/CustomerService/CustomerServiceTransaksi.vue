<template>
  <v-main class="transaksi">
    <h3 class="text-h3 font-weight-medium mb-5">Transaksi</h3>
    <v-card>
      <v-card-title>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-data-table :headers="headers" :items="transaksis" :search="search">
        <template v-slot:[`item.tanggal_transaksi_sewa_mobil`]="{ item }">
          {{ tanggal(item.tanggal_transaksi_sewa_mobil) }}
        </template>
        <template v-slot:[`item.tanggal_mulai_sewa_mobil`]="{ item }">
          {{ tanggal(item.tanggal_mulai_sewa_mobil) }}
        </template>
        <template v-slot:[`item.tanggal_selesai_sewa_mobil`]="{ item }">
          {{ tanggal(item.tanggal_selesai_sewa_mobil) }}
        </template>
        <template v-slot:[`item.tanggal_pengembalian_mobil`]="{ item }">
          {{ tanggal(item.tanggal_pengembalian_mobil) }}
        </template>
        <template v-slot:[`item.bukti_pembayaran`]="{ item }">
          <div v-show="item.bukti_pembayaran != null">
            <a :href="url + 'bukti_pembayaran/' + item.bukti_pembayaran" target="_blank">
              <v-img :src="url + 'bukti_pembayaran/' + item.bukti_pembayaran" style="width: 100px; height: 100px"></v-img>
            </a>
          </div>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn small class="ma-1 mb-3" @click="editHandler(item)" color="primary"> EDIT </v-btn>
          
          <v-btn small class="mb-3" @click="deleteHandler(item.id_transaksi)" color="red darken-2"> DELETE </v-btn>
          <a :href="url + 'api/transaksi/cetak_nota/' + item.id_transaksi" target="_blank" style="text-decoration: none" v-show="item.total_transaksi != null">
            <v-btn small class="mb-1" color="warning"> CETAK NOTA </v-btn>
          </a>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="dialog" persistent width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }} Transaksi</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px" min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="form.tanggal_pengembalian_mobil" label="Tanggal Pengembalian Mobil" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="form.tanggal_pengembalian_mobil" no-title @input="menu = false"></v-date-picker>
            </v-menu>
            <v-menu ref="menu2" v-model="menu3" :close-on-content-click="false" :nudge-right="40" :return-value.sync="form.waktu_pengembalian_mobil" transition="scale-transition" offset-y max-width="290px" min-width="290px">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="form.waktu_pengembalian_mobil" label="Waktu Pengembalian Mobil" prepend-icon="mdi-clock-time-four-outline" readonly v-bind="attrs" v-on="on"></v-text-field>
              </template>
              <v-time-picker v-if="menu3" v-model="form.waktu_pengembalian_mobil" full-width @click:minute="$refs.menu2.save(form.waktu_pengembalian_mobil)" format="24hr"></v-time-picker>
            </v-menu>
            <v-select v-model="form.status_transaksi" :items="['Belum Verifikasi', 'Verifikasi Gagal', 'Transaksi Sedang Berjalan', 'Pembayaran Gagal', 'Berhasil']" label="Status Transaksi" required></v-select>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="cancel"> Cancel </v-btn>
          <v-btn color="blue darken-1" text @click="setForm"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogConfirm" persistent max-width="400px">
      <v-card>
        <v-card-title>
          <span class="headline">Warning!</span>
        </v-card-title>
        <v-card-text> Anda Yakin ingin menghapus Transaksi ini? </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialogConfirm = false"> Cancel </v-btn>
          <v-btn color="blue darken-1" text @click="deleteData"> Delete </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :color="color" timeout="2000" bottom>{{ error_message }}</v-snackbar>
  </v-main>
</template>

<script>
export default {
  name: "CustomerServiceTransaksi",
  data() {
    return {
      inputType: "Ubah",
      load: false,
      snackbar: false,
      error_message: "",
      color: "",
      search: null,
      dialog: false,
      dialogConfirm: false,
      headers: [
        { text: "Nama Transaksi", align: "start", sortable: true, value: "format_id_transaksi" },
        { text: "Nama Customer", value: "customer.nama_customer" },
        { text: "Nama Mobil", value: "mobil.nama_mobil_sewa" },
        { text: "Nama Driver", value: "driver.nama_driver" },
        { text: "Nama Promo", value: "promo.kode_promo" },
        { text: "Nama Pegawai", value: "pegawai.nama_pegawai" },
        { text: "Tanggal dan Waktu Transaksi", value: "tanggal_transaksi_sewa_mobil" },
        { text: "Tanggal dan Waktu Mulai Sewa Mobil", value: "tanggal_mulai_sewa_mobil" },
        { text: "Tanggal dan Waktu Selesai Sewa Mobil", value: "tanggal_selesai_sewa_mobil" },
        { text: "Tanggal dan Waktu Pengembalian Mobil", value: "tanggal_pengembalian_mobil" },
        { text: "Metode Pembayaran", value: "metode_pembayaran" },
        { text: "Jenis Penyewaan Mobil", value: "jenis_penyewaan_mobil" },
        { text: "Denda Pembayaran", value: "denda_penyewaan" },
        { text: "Total Transaksi", value: "total_transaksi" },
        { text: "Bukti Pembayaran", value: "bukti_pembayaran" },
        { text: "Rating Driver", value: "rating_driver" },
        { text: "Rating Perusahaan", value: "rating_perusahaan" },
        { text: "Status Transaksi", value: "status_transaksi" },
        { text: "Actions", align: "center", value: "actions" },
      ],
      transaksis: [],
      mobil: [],
      driver: [],
      promo: [],
      form: {
        tanggal_pengembalian_mobil: null,
        waktu_pengembalian_mobil: null,
        status_transaksi: null,
      },
      formMobil: {
        id_mobil_sewa: null,
        nama_mobil_sewa: null,
      },
      formDriver: {
        id_driver: null,
        nama_driver: null,
      },
      formPromo: {
        id_promo: null,
        kode_promo: null,
        potongan_promo: null,
      },
      deleteId: "",
      editId: "",
      menu: false,
      menu3: false,
      date: "",
      preview_bukti_pembayaran: "",
      url: "https://api.responsi-p3l-0345.xyz/",
    };
  },
  methods: {
    setForm() {
      this.update();
    },
    // Read Data transaksis
    readData() {
      var url = this.$api + "/transaksi";
      this.$http.get(url).then((response) => {
        this.transaksis = response.data.transaksi;
      });
    },
    // ubah data course
    update() {
      var year, temp;
      if (this.form.tanggal_pengembalian_mobil != null) {
        this.date = this.form.tanggal_pengembalian_mobil.split("-");
        if (this.date[0].length == 4) {
          year = this.date[0].substr(2, 3);
          temp = year + "-" + this.date[1] + "-" + this.date[2] + " " + this.form.waktu_pengembalian_mobil;
        } else {
          temp = this.date[0] + "-" + this.date[1] + "-" + this.date[2] + " " + this.form.waktu_pengembalian_mobil;
        }
      }

      let data = {
        id_pegawai: localStorage.getItem("id"),
        tanggal_pengembalian_mobil: temp,
        status_transaksi: this.form.status_transaksi,
      };

      var url = this.$api + "/transaksi/" + this.editId;
      this.load = true;
      this.$http
        .post(url, data)
        .then((response) => {
          this.error_message = response.data.message;
          this.color = "green";
          this.snackbar = true;
          this.load = false;
          this.close();
          this.readData(); // baca data
          this.resetForm();
        })
        .catch((error) => {
          this.error_message = error.response.data.message;
          this.color = "red";
          this.snackbar = true;
          this.load = false;
        });
    },
    // Hapus data produk
    deleteData() {
      //menghapus data
      var url = this.$api + "/transaksi/" + this.deleteId;
      this.load = true;
      this.$http
        .delete(url)
        .then((response) => {
          this.error_message = response.data.message;
          this.color = "green";
          this.snackbar = true;
          this.load = false;
          this.close();
          this.readData(); // baca data
          this.resetForm();
        })
        .catch((error) => {
          this.error_message = error.response.data.message;
          this.color = "red";
          this.snackbar = true;
          this.load = false;
        });
    },
    editHandler(item) {
      var temp;
      this.inputType = "Ubah";
      this.editId = item.id_transaksi;
      if (item.tanggal_pengembalian_mobil != null) {
        temp = item.tanggal_pengembalian_mobil.split(" ");
        this.form.tanggal_pengembalian_mobil = temp[0];
        this.form.waktu_pengembalian_mobil = temp[1];
      }
      this.form.status_transaksi = item.status_transaksi;
      this.dialog = true;
    },
    deleteHandler(id) {
      this.deleteId = id;
      this.dialogConfirm = true;
    },
    close() {
      this.dialog = false;
      this.dialogConfirm = false;
      this.readData();
    },
    cancel() {
      this.resetForm();
      this.readData();
      this.dialog = false;
      this.dialogConfirm = false;
    },
    resetForm() {
      this.preview_bukti_pembayaran = "";
      this.form = {
        tanggal_pengembalian_mobil: null,
        waktu_pengembalian_mobil: null,
        status_transaksi: null,
      };
    },
    bukti_pembayaran(image) {
      if (!image) {
        this.preview_bukti_pembayaran = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.preview_bukti_pembayaran = e.target.result;
      };
      reader.readAsDataURL(image);
    },
    read_mobil_id() {
      var url = this.$api + "/mobil";
      this.$http.get(url).then((response) => {
        let temp = response.data.data;
        this.formMobil.id_mobil_sewa = temp.map((v) => v.id_mobil_sewa);
        this.formMobil.nama_mobil_sewa = temp.map((v) => v.nama_mobil_sewa);
        for (let i = 0; i < this.formMobil.nama_mobil_sewa.length; i++) {
          this.mobil.push(this.formMobil.nama_mobil_sewa[i]);
        }
      });
    },
    read_driver_id() {
      var url = this.$api + "/driverAll";
      this.$http.get(url).then((response) => {
        let temp = response.data.data;
        this.formDriver.id_driver = temp.map((v) => v.id_driver);
        this.formDriver.nama_driver = temp.map((v) => v.nama_driver);
        for (let i = 0; i < this.formDriver.nama_driver.length; i++) {
          this.driver.push(this.formDriver.nama_driver[i]);
        }
      });
    },
    read_promo_id() {
      var url = this.$api + "/promoAll";
      this.$http.get(url).then((response) => {
        let temp = response.data.promo;
        this.formPromo.id_promo = temp.map((v) => v.id_promo);
        this.formPromo.kode_promo = temp.map((v) => v.kode_promo);
        this.formPromo.potongan_promo = temp.map((v) => v.potongan_promo);
        for (let i = 0; i < this.formPromo.kode_promo.length; i++) {
          this.promo.push(this.formPromo.kode_promo[i] + ": Diskon " + this.formPromo.potongan_promo[i] + "%");
        }
      });
    },
    tanggal(item) {
      if (item != null) {
        var temp, temp2, temp3, year;
        temp = item.split(" ");
        temp2 = temp[0].split("-");
        year = Number(temp2[0]);
        if (year < 40) year = year + 2000;
        else year = year + 1900;
        temp3 = year.toString() + "-" + temp2[1] + "-" + temp2[2] + " " + temp[1];
        return temp3;
      }
    },
  },
  computed: {
    formTitle() {
      return this.inputType;
    },
  },
  mounted() {
    this.readData();
    this.read_mobil_id();
    this.read_driver_id();
    this.read_promo_id();
  },
};
</script>
