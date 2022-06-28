<template>
  <v-main style="height: 100%">
    <h3 class="text-h3 font-weight-medium mt-10 mb-5">Transaksi</h3>
    <v-layout class="justifycenter">
      <v-card width="100%">
        <v-card-title>
          <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
          <v-spacer></v-spacer>
          <v-btn color="success" dark @click="dialog = true"> <v-icon left>mdi-plus</v-icon> Tambah </v-btn>
        </v-card-title>
        <v-data-table :headers="headers" :items="transaksis" :search="search">
          <template v-slot:[`item.tanggal_mulai_sewa_mobil`]="{ item }">
            {{ tanggal(item.tanggal_mulai_sewa_mobil) }}
          </template>
          <template v-slot:[`item.tanggal_selesai_sewa_mobil`]="{ item }">
            {{ tanggal(item.tanggal_selesai_sewa_mobil) }}
          </template>
          <template v-slot:[`item.driver.nama_driver`]="{ item }">
            <div v-if="item.driver == null">(Kosong)</div>
            <div v-else>{{ item.driver.nama_driver }}</div>
          </template>
          <template v-slot:[`item.promo.kode_promo`]="{ item }">
            <div v-if="item.promo == null">(Kosong)</div>
            <div v-else>{{ item.promo.kode_promo }}</div>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn small class="ma-1 mb-3" @click="editHandler(item)" color="primary" v-show="item.status_transaksi != 'Berhasil' && item.total_transaksi == null"> EDIT </v-btn>
            <v-btn small class="mb-3" @click="bayar(item)" color="green accent-2" v-show="item.status_transaksi != 'Berhasil' && item.rating_perusahaan == null && item.tanggal_pengembalian_mobil != null"> PEMBAYARAN </v-btn>
            <v-btn small @click="deleteHandler(item)" class="mb-3" color="red darken-2" v-show="item.status_transaksi != 'Berhasil' && item.total_transaksi == null"> CANCEL </v-btn>
            <a :href="url + 'api/transaksi/cetak_nota/' + item.id_transaksi" target="_blank" style="text-decoration: none" v-show="item.total_transaksi != null">
              <v-btn small class="mb-1" color="warning"> CETAK NOTA </v-btn>
            </a>
          </template>
        </v-data-table>
      </v-card>
    </v-layout>

    <v-dialog v-model="dialogBayar" persistent width="600px">
      <v-form v-model="valid2" ref="form2">
        <v-card>
          <v-card-title>
            <span class="headline">Pembayaran</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <p class="text-left" v-show="form.metode_pembayaran == 'Transfer'">
                Silahkan melakukan pembayaran sesuai dengan total transaksi <br />
                Pembayaran dapat dilakukan melalui bank yang tersedia. <br />No rekening: 123-45-678910
              </p>
              <v-text-field v-model="form.denda_penyewaan" label="Denda Penyewaan" readonly></v-text-field>
              <v-text-field v-model="form.diskon" label="Diskon" readonly></v-text-field>
              <v-text-field v-model="form.total_transaksi" label="Total Transaksi" readonly></v-text-field>
              <v-file-input v-model="formTambah.bukti_pembayaran" accept="image/*" show-size label="Bukti Pembayaran" @change="bukti_pembayaran" v-show="form.metode_pembayaran === 'Transfer'" :rules="cek" />
              <v-img :src="preview_bukti_pembayaran" class="mb-6" v-if="preview_bukti_pembayaran" width="200"></v-img>
              <v-select v-model="formTambah.rating_driver" :items="['1', '2', '3', '4', '5']" label="Rating Driver" required :rules="ratingDriverRules" v-show="form.jenis_penyewaan_mobil === 'Peminjaman Mobil + Driver'"></v-select>
              <v-select v-model="formTambah.rating_perusahaan" :items="['1', '2', '3', '4', '5']" label="Rating Perusahaan" required :rules="ratingPerusahaanRules"></v-select>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
            <v-btn color="blue darken-1" text @click="updateBayar"> Save </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-dialog v-model="dialog" persistent width="600px">
      <v-form v-model="valid" ref="form">
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }} Transaksi</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-select v-model="formTambah.mobil" :items="mobil" label="Nama Mobil" required :rules="mobilRules"></v-select>
              <v-select v-model="formTambah.jenis_penyewaan_mobil" :items="['Peminjaman Mobil', 'Peminjaman Mobil + Driver']" label="Jenis Penyewaan Mobil" required :rules="jenisPenyewaanRules"></v-select>
              <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px" min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="formTambah.tanggal_mulai_sewa_mobil" label="Tanggal Mulai Sewa" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on" :rules="tanggalMulaiRules"></v-text-field>
                </template>
                <v-date-picker v-model="formTambah.tanggal_mulai_sewa_mobil" no-title @input="menu = false"></v-date-picker>
              </v-menu>
              <v-menu ref="menu3" v-model="menu4" :close-on-content-click="false" :nudge-right="40" :return-value.sync="formTambah.waktu_mulai_sewa_mobil" transition="scale-transition" offset-y max-width="290px" min-width="290px">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="formTambah.waktu_mulai_sewa_mobil" label="Waktu Mulai Sewa" prepend-icon="mdi-clock-time-four-outline" readonly v-bind="attrs" v-on="on" :rules="waktuMulaiRules"></v-text-field>
                </template>
                <v-time-picker v-if="menu4" v-model="formTambah.waktu_mulai_sewa_mobil" full-width @click:minute="$refs.menu3.save(formTambah.waktu_mulai_sewa_mobil)" format="24hr"></v-time-picker>
              </v-menu>
              <v-menu v-model="menu2" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px" min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="formTambah.tanggal_selesai_sewa_mobil" label="Tanggal Selesai Sewa" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on" :rules="tanggalSelesaiRules"></v-text-field>
                </template>
                <v-date-picker v-model="formTambah.tanggal_selesai_sewa_mobil" no-title @input="menu2 = false"></v-date-picker>
              </v-menu>
              <v-menu ref="menu5" v-model="menu6" :close-on-content-click="false" :nudge-right="40" :return-value.sync="formTambah.waktu_selesai_sewa_mobil" transition="scale-transition" offset-y max-width="290px" min-width="290px">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="formTambah.waktu_selesai_sewa_mobil" label="Waktu Selesai Sewa" prepend-icon="mdi-clock-time-four-outline" readonly v-bind="attrs" v-on="on" :rules="waktuSelesaiRules"></v-text-field>
                </template>
                <v-time-picker v-if="menu6" v-model="formTambah.waktu_selesai_sewa_mobil" full-width @click:minute="$refs.menu5.save(formTambah.waktu_selesai_sewa_mobil)" format="24hr"></v-time-picker>
              </v-menu>
              <v-select v-model="formTambah.metode_pembayaran" :items="['Transfer', 'Cash']" label="Metode Pembayaran" required :rules="metodePembayaranRules"></v-select>
              <v-select v-model="formTambah.promo" :items="promo" label="Promo" required></v-select>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
            <v-btn color="blue darken-1" text @click="setForm"> Save </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-dialog v-model="dialogConfirm" persistent max-width="400px">
      <v-card>
        <v-card-title>
          <span class="headline">Warning!</span>
        </v-card-title>
        <v-card-text> Anda Yakin ingin membatalkan Transaksi ini? </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialogConfirm = false"> Cancel </v-btn>
          <v-btn color="blue darken-1" text @click="deleteData"> Delete </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="color" timeout="2000" bottom> {{ error_message }} </v-snackbar>
  </v-main>
</template>

<style scoped>
.backgroundhead {
  background-color: #d0d0d0;
}
</style>

<script>
export default {
  name: "CustomerTransaksi",
  data() {
    return {
      load: false,
      snackbar: false,
      error_message: "",
      color: "",
      inputType: "Tambah",
      valid: false,
      valid2: false,
      dialog: false,
      dialogBayar: false,
      dialogConfirm: false,
      search: null,
      headers: [
        { text: "Nomor Transaksi", align: "start", sortable: true, value: "format_id_transaksi" },
        { text: "Nama Customer", value: "customer.nama_customer" },
        { text: "Nama Mobil", value: "mobil.nama_mobil_sewa" },
        { text: "Nama Driver", value: "driver.nama_driver" },
        { text: "Nama Promo", value: "promo.kode_promo" },
        { text: "Nama Pegawai", value: "pegawai.nama_pegawai" },
        { text: "Tanggal dan Waktu Mulai Sewa Mobil", value: "tanggal_mulai_sewa_mobil" },
        { text: "Tanggal dan Waktu Selesai Sewa Mobil", value: "tanggal_selesai_sewa_mobil" },
        { text: "Metode Pembayaran", value: "metode_pembayaran" },
        { text: "Jenis PenyewaanMobil ", value: "jenis_penyewaan_mobil" },
        { text: "Status Transaksi", value: "status_transaksi" },
        { text: "Actions", align: "center", justify: "center", value: "actions" },
      ],
      transaksis: [],
      mobil: [],
      driver: [],
      promo: [],
      form: {
        jenis_penyewaan_mobil: null,
        metode_pembayaran: null,
        denda_penyewaan: null,
        diskon: null,
        total_transaksi: null,
      },
      formTambah: {
        mobil: null,
        driver: null,
        promo: null,
        tanggal_mulai_sewa_mobil: null,
        waktu_mulai_sewa_mobil: null,
        tanggal_selesai_sewa_mobil: null,
        waktu_selesai_sewa_mobil: null,
        jenis_penyewaan_mobil: null,
        metode_pembayaran: null,
        bukti_pembayaran: null,
        rating_driver: null,
        rating_perusahaan: null,
        total_transaksi: null,
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
      mobilRules: [(v) => !!v || "Mobil tidak boleh kosong :("],
      jenisPenyewaanRules: [(v) => !!v || "Jenis Penyewaan tidak boleh kosong :("],
      tanggalMulaiRules: [(v) => !!v || "Tanggal Mulai Sewa tidak boleh kosong :("],
      waktuMulaiRules: [(v) => !!v || "Waktu Mulai Sewa tidak boleh kosong :("],
      tanggalSelesaiRules: [(v) => !!v || "Tanggal Selesai tidak boleh kosong :("],
      waktuSelesaiRules: [(v) => !!v || "Waktu Selesai tidak boleh kosong :("],
      metodePembayaranRules: [(v) => !!v || "Metode Bayar tidak boleh kosong :("],
      ratingDriverRules: [(v) => !!v || "Metode Bayar tidak boleh kosong :("],
      ratingPerusahaanRules: [(v) => !!v || "Metode Bayar tidak boleh kosong :("],
      buktiRules: [(v) => !!v || "Bukti Pembayaran tidak boleh kosong :("],
      menu: false,
      menu2: false,
      menu4: false,
      menu6: false,
      deleteId: "",
      editId: "",
      date: "",
      preview_bukti_pembayaran: "",
      url: "https://api.responsi-p3l-0345.xyz/",
    };
  },
  methods: {
    setForm() {
      if (this.inputType !== "Tambah") {
        this.update();
      } else {
        this.tambah();
      }
    },
    readData() {
      var url = this.$api + "/transaksi/" + localStorage.getItem("id");
      this.$http.get(url).then((response) => {
        this.transaksis = response.data.transaksi;
      });
    },
    tambah() {
      if (this.$refs.form.validate()) {
        //cek validasi data yang terkirim
        this.load = true;
        var year,
          temp = null,
          select = null,
          temp2 = null,
          id_driver = null,
          id_mobil_sewa = null,
          id_promo = null;
        if (this.formTambah.tanggal_mulai_sewa_mobil != null) {
          this.date = this.formTambah.tanggal_mulai_sewa_mobil.split("-");
          year = this.date[0].substr(2, 3);
          temp = year + "-" + this.date[1] + "-" + this.date[2] + " " + this.formTambah.waktu_mulai_sewa_mobil;
        }
        if (this.formTambah.tanggal_selesai_sewa_mobil != null) {
          this.date = this.formTambah.tanggal_selesai_sewa_mobil.split("-");
          year = this.date[0].substr(2, 3);
          temp2 = year + "-" + this.date[1] + "-" + this.date[2] + " " + this.formTambah.waktu_selesai_sewa_mobil;
        }
        if (this.formTambah.mobil != null) {
          select = this.formTambah.mobil;
          for (let i = 0; i < this.formMobil.nama_mobil_sewa.length; i++) {
            if (select.includes(this.formMobil.nama_mobil_sewa[i])) {
              id_mobil_sewa = this.formMobil.id_mobil_sewa[i];
              break;
            }
          }
        }
        if (this.formTambah.promo != null) {
          select = this.formTambah.promo;
          for (let i = 0; i < this.formPromo.kode_promo.length; i++) {
            if (select.includes(this.formPromo.kode_promo[i])) {
              id_promo = this.formPromo.id_promo[i];
              break;
            }
          }
        }
        if (this.driver != null && this.formTambah.jenis_penyewaan_mobil == "Peminjaman Mobil + Driver") id_driver = this.driver[Math.floor(Math.random() * this.driver.length)];

        let data = {
          id_customer: localStorage.getItem("id"),
          id_mobil_sewa: id_mobil_sewa,
          id_driver: id_driver,
          id_promo: id_promo,
          tanggal_mulai_sewa_mobil: temp,
          tanggal_selesai_sewa_mobil: temp2,
          metode_pembayaran: this.formTambah.metode_pembayaran,
          jenis_penyewaan_mobil: this.formTambah.jenis_penyewaan_mobil,
        };
        this.$http
          .post(this.$api + "/transaksi", data)
          .then((response) => {
            //simpan data id user yang diinput
            this.error_message = response.data.message;
            this.color = "green";
            this.snackbar = true;
            this.load = false;
            this.close();
            this.readData(); // baca data
            this.resetFormTambah();
          })
          .catch((error) => {
            this.error_message = error.response.data.message;
            this.color = "red";
            this.snackbar = true;
            this.load = false;
          });
      }
    },
    update() {
      if (this.$refs.form.validate()) {
        //cek validasi data yang terkirim
        this.load = true;
        var select = null,
          id_driver = null,
          id_mobil_sewa = null,
          id_promo = null;
        if (this.formTambah.mobil != null) {
          select = this.formTambah.mobil;
          for (let i = 0; i < this.formMobil.nama_mobil_sewa.length; i++) {
            if (select.includes(this.formMobil.nama_mobil_sewa[i])) {
              id_mobil_sewa = this.formMobil.id_mobil_sewa[i];
              break;
            }
          }
        }
        if (this.formTambah.promo != null) {
          select = this.formTambah.promo;
          for (let i = 0; i < this.formPromo.kode_promo.length; i++) {
            if (select.includes(this.formPromo.kode_promo[i])) {
              id_promo = this.formPromo.id_promo[i];
              break;
            }
          }
        }
        if (this.driver != null && this.formTambah.jenis_penyewaan_mobil == "Peminjaman Mobil + Driver") id_driver = this.driver[Math.floor(Math.random() * this.driver.length)];

        let data = {
          id_mobil_sewa: id_mobil_sewa,
          id_promo: id_promo,
          id_driver: id_driver,
          tanggal_mulai_sewa_mobil: this.formTambah.tanggal_mulai_sewa_mobil + " " + this.formTambah.waktu_mulai_sewa_mobil,
          tanggal_selesai_sewa_mobil: this.formTambah.tanggal_selesai_sewa_mobil + " " + this.formTambah.waktu_selesai_sewa_mobil,
          metode_pembayaran: this.formTambah.metode_pembayaran,
          jenis_penyewaan_mobil: this.formTambah.jenis_penyewaan_mobil,
        };
        this.$http
          .post(this.$api + "/transaksiUpdate/" + this.editId, data)
          .then((response) => {
            //simpan data id user yang diinput
            this.error_message = response.data.message;
            this.color = "green";
            this.snackbar = true;
            this.load = false;
            this.close();
            this.readData(); // baca data
            this.resetFormTambah();
          })
          .catch((error) => {
            this.error_message = error.response.data.message;
            this.color = "red";
            this.snackbar = true;
            this.load = false;
          });
      }
    },
    updateBayar() {
      if (this.$refs.form2.validate()) {
        const formData = new FormData();
        if (this.formTambah.rating_driver != null) formData.append("rating_driver", this.formTambah.rating_driver);
        else formData.append("rating_driver", " ");
        if (this.formTambah.rating_perusahaan != null) formData.append("rating_perusahaan", this.formTambah.rating_perusahaan);
        else formData.append("rating_perusahaan", " ");
        if (this.formTambah.bukti_pembayaran != null) formData.append("bukti_pembayaran", this.formTambah.bukti_pembayaran);
        else formData.append("bukti_pembayaran", " ");

        var url = this.$api + "/transaksi/pembayaran/" + this.editId;
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
            this.close();
            this.readData(); // baca data
            this.resetFormTambah();
          })
          .catch((error) => {
            this.error_message = error.response.data.message;
            this.color = "red";
            this.snackbar = true;
            this.load = false;
          });
      }
    },
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
          this.resetFormTambah();
          this.resetForm();
        })
        .catch((error) => {
          this.error_message = error.response.data.message;
          this.color = "red";
          this.snackbar = true;
          this.load = false;
        });
    },
    bayar(item) {
      if (item.customer != null) {
        if (item.status_transaksi == "Berhasil") {
          this.error_message = "Transaksi Telah Selesai, tidak bisa melakukan pembayaran";
          this.color = "red";
          this.snackbar = true;
          this.load = false;
        } else {
          if (item.rating_perusahaan == null) {
            if (item.tanggal_pengembalian_mobil != null) {
              this.editId = item.id_transaksi;
              this.dialogBayar = true;
              this.form.jenis_penyewaan_mobil = item.jenis_penyewaan_mobil;
              this.form.denda_penyewaan = item.denda_penyewaan;
              this.form.metode_pembayaran = item.metode_pembayaran;
              this.form.total_transaksi = item.total_transaksi;
              this.form.diskon = item.promo.potongan_promo + "%";
            } else {
              this.error_message = "Kembalikan Mobil Terlebih Dahulu";
              this.color = "red";
              this.snackbar = true;
              this.load = false;
            }
          } else {
            this.error_message = "Sudah melakukan Pembayaran";
            this.color = "red";
            this.snackbar = true;
            this.load = false;
          }
        }
      } else {
        this.error_message = "Tidak ada transaksi";
        this.color = "red";
        this.snackbar = true;
        this.load = false;
      }
    },
    deleteHandler(item) {
      if (item.status_transaksi == "Berhasil") {
        this.error_message = "Transaksi Telah Selesai, tidak bisa dibatalkan";
        this.color = "red";
        this.snackbar = true;
        this.load = false;
      } else {
        this.deleteId = item.id_transaksi;
        this.dialogConfirm = true;
      }
    },
    editHandler(item) {
      if (item.status_transaksi == "Berhasil") {
        this.error_message = "Transaksi Telah Selesai, tidak bisa diedit";
        this.color = "red";
        this.snackbar = true;
        this.load = false;
      } else {
        this.inputType = "Ubah";
        this.editId = item.id_transaksi;
        this.formTambah.mobil = item.mobil.nama_mobil_sewa;
        if (item.promo != null) this.formTambah.promo = item.promo.kode_promo + ": Diskon " + item.promo.potongan_promo + "%";
        let temp;
        temp = item.tanggal_mulai_sewa_mobil.split(" ");
        this.formTambah.tanggal_mulai_sewa_mobil = temp[0];
        this.formTambah.waktu_mulai_sewa_mobil = temp[1];
        temp = item.tanggal_selesai_sewa_mobil.split(" ");
        this.formTambah.tanggal_selesai_sewa_mobil = temp[0];
        this.formTambah.waktu_selesai_sewa_mobil = temp[1];
        this.formTambah.jenis_penyewaan_mobil = item.jenis_penyewaan_mobil;
        this.formTambah.metode_pembayaran = item.metode_pembayaran;
        this.dialog = true;
      }
    },
    close() {
      this.resetFormTambah();
      this.resetForm();
      this.readData();
      this.dialog = false;
      this.dialogConfirm = false;
      this.dialogBayar = false;
      if (this.$refs.form != null) this.$refs.form.resetValidation();
      if (this.$refs.form2 != null) this.$refs.form2.resetValidation();
    },
    resetForm() {
      this.form = {
        jenis_penyewaan_mobil: null,
        metode_pembayaran: null,
        denda_penyewaan: null,
        diskon: null,
        total_transaksi: null,
      };
    },
    resetFormTambah() {
      this.preview_bukti_pembayaran = "";
      this.formTambah = {
        mobil: null,
        driver: null,
        promo: null,
        tanggal_mulai_sewa_mobil: null,
        waktu_mulai_sewa_mobil: null,
        tanggal_selesai_sewa_mobil: null,
        waktu_selesai_sewa_mobil: null,
        jenis_penyewaan_mobil: null,
        metode_pembayaran: null,
        bukti_pembayaran: null,
        rating_driver: null,
        rating_perusahaan: null,
        total_transaksi: null,
      };
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
      var url = this.$api + "/driver";
      this.$http.get(url).then((response) => {
        let temp = response.data.data;
        this.formDriver.id_driver = temp.map((v) => v.id_driver);
        this.formDriver.nama_driver = temp.map((v) => v.nama_driver);
        for (let i = 0; i < this.formDriver.nama_driver.length; i++) {
          this.driver.push(this.formDriver.id_driver[i]);
        }
      });
    },
    read_promo_id() {
      var url = this.$api + "/promo";
      this.$http.get(url).then((response) => {
        let temp = response.data.data;
        this.formPromo.id_promo = temp.map((v) => v.id_promo);
        this.formPromo.kode_promo = temp.map((v) => v.kode_promo);
        this.formPromo.potongan_promo = temp.map((v) => v.potongan_promo);
        for (let i = 0; i < this.formPromo.kode_promo.length; i++) {
          this.promo.push(this.formPromo.kode_promo[i] + ": Diskon " + this.formPromo.potongan_promo[i] + "%");
        }
      });
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
  mounted() {
    this.readData();
    this.read_mobil_id();
    this.read_driver_id();
    this.read_promo_id();
  },
  computed: {
    cek() {
      const rules = [];
      if (this.form.metode_pembayaran == "Transfer") {
        const rule = (v) => !!v || "Bukti Pembayaran tidak boleh kosong :(";
        rules.push(rule);
      }
      return rules;
    },
    formTitle() {
      return this.inputType;
    },
  },
};
</script>