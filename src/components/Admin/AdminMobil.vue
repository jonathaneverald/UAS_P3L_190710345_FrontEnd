<template>
    <v-main class="mobil">
        <h3 class="text-h3 font-weight-medium mb-5">Mobil</h3>
        <v-card>
            <v-btn class="mt-6 mr-3" color="green" outlined @click="readData">Tampil Mobil</v-btn>
            <v-btn class="mt-6 mr-3" color="green" outlined @click="readDataKontrak">Tampil Mobil Mitra</v-btn>
            <v-card-title>
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
                <v-spacer></v-spacer>
                <v-btn color="success" dark @click="dialog = true"><v-icon left>mdi-plus</v-icon>Tambah</v-btn>
            </v-card-title>

            <v-data-table :headers="headers" :items="mobils" :search="search">
                <template v-slot:[`item.kategori_aset`]="{ item }">
                    <div v-if="item.kategori_aset === 0">Milik Perusahaan</div>
                    <div v-else>Milik Mitra</div>
                </template>
                <template v-slot:[`item.foto_mobil`]="{ item }">
                    <a :href="url + 'foto_mobil/' + item.foto_mobil" target="blank">
                        <v-img :src="url + 'foto_mobil/' + item.foto_mobil" contain width= "150px" height= "200px"></v-img>
                    </a>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn color="success" class="mr-2" @click="editHandler(item)"><v-icon left>mdi-pencil</v-icon>Edit</v-btn>
                    <v-btn color="success" class="mr-2" @click="editKontrak(item)"><v-icon left>mdi-pencil</v-icon>Edit Kontrak</v-btn>
                    <v-btn color="error" @click="deleteHandler(item.id_mobil_sewa)"><v-icon left>mdi-delete </v-icon>Delete</v-btn>
                </template>
            </v-data-table>

        </v-card>

        <v-dialog v-model="dialog" persistent width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ formTitle }} Mobil</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-text-field v-model="form.nama_mobil_sewa" label="Nama Mobil" required></v-text-field>   <!-- 17-33 kalau dicomment, tabel muncul-->
                        <v-select v-model="form.tipe_mobil_sewa" :items ="['Sedan', 'City Car', 'SUV', 'MPV']" label="Tipe Mobil" required></v-select>
                        <v-select v-model="form.jenis_transmisi" :items ="['AT', 'MT', 'RVT']" label="Transmisi" required></v-select>
                        <v-select v-model="form.jenis_bahan_bakar" :items ="['Pertamax', 'Pertalite']" label="Bahan Bakar" required></v-select>
                        <v-text-field v-model="form.warna_mobil_sewa" label="Warna Mobil" required></v-text-field>
                        <v-text-field v-model="form.volume_bagasi_mobil" label="Volume Bagasi" required></v-text-field>
                        <v-text-field v-model="form.fasilitas_mobil" label="Fasilitas Mobil" required></v-text-field>
                        <v-text-field v-model="form.harga_sewa_mobil" label="Harga Sewa Mobil" required></v-text-field>
                        <v-select v-model="form.kapasitas" :items ="['2', '4', '6', '8']" label="Kapasitas Mobil" required></v-select>
                        <v-text-field v-model="form.plat_nomor" label="Plat Nomor" required></v-text-field>
                        <v-text-field v-model="form.no_stnk" label="Nomor STNK" required></v-text-field>
                        <v-select v-model="form.kategori_aset" :items ="['Milik Perusahaan', 'Milik Mitra']" label="Kategori Aset Mobil" @change="kontrak" required></v-select>
                        <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px" min-width="auto">
                            <template v-slot:activator="{on, attrs}">
                                <v-text-field v-model="form.tgl_terakhir_servis" label="Tanggal Terakhir Servis" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="form.tgl_terakhir_servis" no-title @input="menu = false"></v-date-picker>
                        </v-menu>
                        <v-select v-model="form.status_mobil" :items ="['Tersedia', 'Tidak Tersedia']" label="Status Mobil" required></v-select>
                        <v-file-input v-model="form.foto_mobil" accept="image/*" show-size label="Foto Mobil" @change="foto_mobil"/>
                        <v-img :src="preview_foto_mobil" v-if="preview_foto_mobil" width="200"></v-img>
                        <v-menu v-model="menu1" v-if="show" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px" min-width="auto">
                            <template v-slot:activator="{on, attrs}">
                                <v-text-field v-model="form.periode_mulai_sewa" label="Periode Mulai Kontrak" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="form.periode_mulai_sewa" no-title @input="menu1 = false"></v-date-picker>
                        </v-menu>
                        <v-menu v-model="menu2" v-if="show" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px" min-width="auto">
                            <template v-slot:activator="{on, attrs}">
                                <v-text-field v-model="form.periode_akhir_sewa" label="Periode Akhir Kontrak" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="form.periode_akhir_sewa" no-title @input="menu2 = false"></v-date-picker>
                        </v-menu>
                        <v-select v-model="form.nama_pemilik_mobil_sewa" v-if="show" :items ="pemilik_mobil" label="Nama Pemilik Mobil" required></v-select>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="cancel">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="setForm">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogKontrak" persistent width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Kontrak Mobil</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-menu v-model="menuKontrak" v-if="show" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px" min-width="auto">
                            <template v-slot:activator="{on, attrs}">
                                <v-text-field v-model="form.periode_mulai_sewa" label="Periode Mulai Kontrak" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="form.periode_mulai_sewa" no-title @input="menuKontrak = false"></v-date-picker>
                        </v-menu>
                        <v-menu v-model="menuKontrak1" v-if="show" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px" min-width="auto">
                            <template v-slot:activator="{on, attrs}">
                                <v-text-field v-model="form.periode_akhir_sewa" label="Periode Akhir Kontrak" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="form.periode_akhir_sewa" no-title @input="menuKontrak1 = false"></v-date-picker>
                        </v-menu>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="cancel">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="saveKontrak">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogConfirm" persistent max-width="400px">
            <v-card>
                <v-card-title>
                    <span class="headline">Warning!</span>
                </v-card-title>
                <v-card-text>Anda yakin ingin menghapus Mobil ini?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="cancel">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="deleteData">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="snackbar" :color="color" timeout="2000" bottom>{{ error_message }}</v-snackbar>
        
    </v-main>
</template>

<script> 
export default{
    name: "AdminMobil",
    data(){
        return{
            inputType: "Tambah",
            load: false,
            snackbar: false,
            error_message: "",
            color: "",
            search: null,
            dialog: false,
            dialogKontrak: false,
            dialogConfirm: false,
            headers:[
                { text: "Nama Mobil", align: "start", sortable: true, value: "nama_mobil_sewa" },
                { text: "Tipe Mobil", value: "tipe_mobil_sewa" },
                { text: "Transmisi", value: "jenis_transmisi" },
                { text: "Bahan Bakar", value: "jenis_bahan_bakar" },
                { text: "Warna Mobil", value: "warna_mobil_sewa" },
                { text: "Volume Bagasi Mobil", value: "volume_bagasi_mobil" },
                { text: "Fasilitas Mobil", value: "fasilitas_mobil" },
                { text: "Harga Sewa Mobil", value: "harga_sewa_mobil" },
                { text: "Kapasitas Mobil", value: "kapasitas" },
                { text: "Plat Nomor", value: "plat_nomor" },
                { text: "Nomor STNK", value: "no_stnk" },
                { text: "Kategori Aset Mobil", value: "kategori_aset" },
                { text: "Tanggal Terakhir Servis", value: "tgl_terakhir_servis" },
                { text: "Status Mobil", value: "status_mobil" },
                { text: "Foto Mobil", value: "foto_mobil" },
                { text: "Periode Mulai Kontrak", value: "periode_mulai_sewa" },
                { text: "Periode Akhir Kontrak", value: "periode_akhir_sewa" },
                { text: "Nama Pemilik Mobil", value: "pemilik_mobil.nama_pemilik_mobil_sewa" },
                { text: "Actions", value: "actions" },
            ],
            mobils: [],
            pemilik_mobil: [],
            form: {
                nama_mobil_sewa: null,
                tipe_mobil_sewa: null,
                jenis_transmisi: null,
                jenis_bahan_bakar: null,
                warna_mobil_sewa: null,
                volume_bagasi_mobil: null,
                fasilitas_mobil: null,
                harga_sewa_mobil: null,
                kapasitas: null,
                plat_nomor: null,
                no_stnk: null,
                kategori_aset: null,
                tgl_terakhir_servis: null,
                status_mobil: null,
                foto_mobil: null,
                periode_mulai_sewa: null,
                periode_akhir_sewa: null,
                nama_pemilik_mobil_sewa: null,
            },
            form_pemilik_mobil:{
                id_pemilik_mobil_sewa: null,
                nama_pemilik_mobil_sewa: null,
            },
            show: false,
            deleteId: "",
            editId: "",
            menu: false,
            menu1: false,
            menu2: false,
            menuKontrak: false,
            menuKontrak1: false,
            date: "",
            preview_foto_mobil: "",
            url: "https://api.responsi-p3l-0345.xyz/",
        };
    },
    methods: {
        setForm(){
            if(this.inputType !== "Tambah"){
                this.update();
            }else{
                this.save();
            }
        },
        //read data mobils
        readData(){
            this.mobils = [];
            var url = this.$api + "/mobil";
            this.$http.get(url).then((response) => {
                this.mobils = response.data.data;
            });
        },
        readDataKontrak(){
            this.mobils = [];
            var url = this.$api + "/mobil_kontrak";
            this.$http.get(url).then((response) => {
                this.mobils = response.data.data;
            });
        },
        //simpan data mobil
        save(){
            this.load = true;
            var year, temp, id_pemilik_mobil_sewa = null, select = null;
            const formData = new FormData();
            temp = this.form.tgl_terakhir_servis;
            if(this.form.tgl_terakhir_servis != null){
                this.date = this.form.tgl_terakhir_servis.split("-");
                year = this.date[0].substr(2, 3);
                temp = year + "-" + this.date[1] + "-" + this.date[2];
                formData.append("tgl_terakhir_servis", temp);
            }
            else
                formData.append("tgl_terakhir_servis", "");
            if(this.form.nama_mobil_sewa != null)
                formData.append("nama_mobil_sewa", this.form.nama_mobil_sewa);
            else
                formData.append("nama_mobil_sewa", "");
            if(this.form.tipe_mobil_sewa != null)
                formData.append("tipe_mobil_sewa", this.form.tipe_mobil_sewa);
            else
                formData.append("tipe_mobil_sewa", "");
            if(this.form.jenis_transmisi != null)
                formData.append("jenis_transmisi", this.form.jenis_transmisi);
            else
                formData.append("jenis_transmisi", "");
            if(this.form.jenis_bahan_bakar != null)
                formData.append("jenis_bahan_bakar", this.form.jenis_bahan_bakar);
            else
                formData.append("jenis_bahan_bakar", "");
            if(this.form.warna_mobil_sewa != null)
                formData.append("warna_mobil_sewa", this.form.warna_mobil_sewa);
            else
                formData.append("warna_mobil_sewa", "");
            if(this.form.volume_bagasi_mobil != null)
                formData.append("volume_bagasi_mobil", this.form.volume_bagasi_mobil);
            else
                formData.append("volume_bagasi_mobil", "");
            if(this.form.fasilitas_mobil != null)
                formData.append("fasilitas_mobil", this.form.fasilitas_mobil);
            else
                formData.append("fasilitas_mobil", "");
            if(this.form.harga_sewa_mobil != null)
                formData.append("harga_sewa_mobil", this.form.harga_sewa_mobil);
            else
                formData.append("harga_sewa_mobil", "");
            if(this.form.kapasitas != null)
                formData.append("kapasitas", this.form.kapasitas);
            else
                formData.append("kapasitas", "");
            if(this.form.plat_nomor != null)
                formData.append("plat_nomor", this.form.plat_nomor);
            else
                formData.append("plat_nomor", "");
            if(this.form.no_stnk != null)
                formData.append("no_stnk", this.form.no_stnk);
            else
                formData.append("no_stnk", "")
            if(this.form.kategori_aset != null){
                if(this.form.kategori_aset == "Milik Perusahaan"){
                    formData.append("kategori_aset", 0);
                }
                else{
                    formData.append("kategori_aset", 1);
                    if(this.form.periode_mulai_sewa != null){
                        this.date = this.form.periode_mulai_sewa.split("-");
                        year = this.date[0].substr(2, 3);
                        temp = year + "-" + this.date[1] + "-" + this.date[2];
                        formData.append("periode_mulai_sewa", temp);
                    }
                    else
                        formData.append("periode_mulai_sewa", "");
                    if(this.form.periode_akhir_sewa != null){
                        this.date = this.form.periode_akhir_sewa.split("-");
                        year = this.date[0].substr(2, 3);
                        temp = year + "-" + this.date[1] + "-" + this.date[2];
                        formData.append("periode_akhir_sewa", temp);
                    }
                    else
                        formData.append("periode_akhir_sewa", "");
                    if(this.form.nama_pemilik_mobil_sewa != null){
                        select = this.form.nama_pemilik_mobil_sewa;
                        for(let i = 0; i<this.form_pemilik_mobil.nama_pemilik_mobil_sewa.length; i++){
                            if(select.includes(this.form_pemilik_mobil.nama_pemilik_mobil_sewa[i])){
                                id_pemilik_mobil_sewa = this.form_pemilik_mobil.id_pemilik_mobil_sewa[i];
                                break;
                            }
                        }
                        formData.append("id_pemilik_mobil_sewa", id_pemilik_mobil_sewa);
                    }
                    else
                       formData.append("id_pemilik_mobil_sewa", ""); 
                }
            } 
            else
                formData.append("kategori_aset", "");
            if(this.form.status_mobil != null)
                formData.append("status_mobil", this.form.status_mobil);
            else
                formData.append("status_mobil", "");
            if(this.form.foto_mobil != null)
                formData.append("foto_mobil", this.form.foto_mobil);
            else
                formData.append("foto_mobil", "");

            this.$http
                .post(this.$api + "/mobil", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((response) => {
                    this.error_message = response.data.message;
                    this.color = "green",
                    this.snackbar = true;
                    this.load = true;
                    this.close();
                    this.readData(); //membaca data input
                    this.resetForm();
                })
                .catch((error) => {
                    this.error_message = error.response.data.message;
                    this.color = "red";
                    this.snackbar = true;
                    this.load = false;
                });
        },
        //mengubah data mobil
        update(){
            var year, temp, id_pemilik_mobil_sewa = null, select = null;
            const formData = new FormData();
            temp = this.form.tgl_terakhir_servis;
            if(this.form.tgl_terakhir_servis != null){
                this.date = this.form.tgl_terakhir_servis.split("-");
                year = this.date[0].substr(2, 3);
                temp = year + "-" + this.date[1] + "-" + this.date[2];
                formData.append("tgl_terakhir_servis", temp);
            }
            else
                formData.append("tgl_terakhir_servis", "");
            if(this.form.nama_mobil_sewa != null)
                formData.append("nama_mobil_sewa", this.form.nama_mobil_sewa);
            else
                formData.append("nama_mobil_sewa", "");
            if(this.form.tipe_mobil_sewa != null)
                formData.append("tipe_mobil_sewa", this.form.tipe_mobil_sewa);
            else
                formData.append("tipe_mobil_sewa", "");
            if(this.form.jenis_transmisi != null)
                formData.append("jenis_transmisi", this.form.jenis_transmisi);
            else
                formData.append("jenis_transmisi", "");
            if(this.form.jenis_bahan_bakar != null)
                formData.append("jenis_bahan_bakar", this.form.jenis_bahan_bakar);
            else
                formData.append("jenis_bahan_bakar", "");
            if(this.form.warna_mobil_sewa != null)
                formData.append("warna_mobil_sewa", this.form.warna_mobil_sewa);
            else
                formData.append("warna_mobil_sewa", "");
            if(this.form.volume_bagasi_mobil != null)
                formData.append("volume_bagasi_mobil", this.form.volume_bagasi_mobil);
            else
                formData.append("volume_bagasi_mobil", "");
            if(this.form.fasilitas_mobil != null)
                formData.append("fasilitas_mobil", this.form.fasilitas_mobil);
            else
                formData.append("fasilitas_mobil", "");
            if(this.form.harga_sewa_mobil != null)
                formData.append("harga_sewa_mobil", this.form.harga_sewa_mobil);
            else
                formData.append("harga_sewa_mobil", "");
            if(this.form.kapasitas != null)
                formData.append("kapasitas", this.form.kapasitas);
            else
                formData.append("kapasitas", "");
            if(this.form.plat_nomor != null)
                formData.append("plat_nomor", this.form.plat_nomor);
            else
                formData.append("plat_nomor", "");
            if(this.form.no_stnk != null)
                formData.append("no_stnk", this.form.no_stnk);
            else
                formData.append("no_stnk", "")
            if(this.form.kategori_aset != null){
                if(this.form.kategori_aset == "Milik Perusahaan"){
                    formData.append("kategori_aset", 0);
                    formData.append("periode_mulai_sewa", "");
                    formData.append("periode_akhir_sewa", "");
                    formData.append("id_pemilik_mobil_sewa", "");
                }
                else{
                    formData.append("kategori_aset", 1);
                    temp = this.form.periode_mulai_sewa;
                    if(this.form.periode_mulai_sewa != null){
                        this.date = this.form.periode_mulai_sewa.split("-");
                        year = this.date[0].substr(2, 3);
                        temp = year + "-" + this.date[1] + "-" + this.date[2];
                        formData.append("periode_mulai_sewa", temp);
                    }
                    else
                        formData.append("periode_mulai_sewa", "");
                    temp = this.form.periode_akhir_sewa;
                    if(this.form.periode_akhir_sewa != null){
                        this.date = this.form.periode_akhir_sewa.split("-");
                        year = this.date[0].substr(2, 3);
                        temp = year + "-" + this.date[1] + "-" + this.date[2];
                        formData.append("periode_akhir_sewa", temp);
                    }
                    else
                        formData.append("periode_akhir_sewa", "");
                    if(this.form.nama_pemilik_mobil_sewa != null){
                        select = this.form.nama_pemilik_mobil_sewa;
                        for(let i = 0; i<this.form_pemilik_mobil.nama_pemilik_mobil_sewa.length; i++){
                            if(select.includes(this.form_pemilik_mobil.nama_pemilik_mobil_sewa[i])){
                                id_pemilik_mobil_sewa = this.form_pemilik_mobil.id_pemilik_mobil_sewa[i];
                                break;
                            }
                        }
                        formData.append("id_pemilik_mobil_sewa", id_pemilik_mobil_sewa);
                    }
                    else
                       formData.append("id_pemilik_mobil_sewa", ""); 
                }
            } 
            else
                formData.append("kategori_aset", "");
            if(this.form.status_mobil != null)
                formData.append("status_mobil", this.form.status_mobil);
            else
                formData.append("status_mobil", "");
            if(this.form.foto_mobil != null)
                formData.append("foto_mobil", this.form.foto_mobil);
            else
                formData.append("foto_mobil", "");

            var url = this.$api + "/mobil/" + this.editId;
            this.$http
                .post(url, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((response) => {
                    this.error_message = response.data.message;
                    this.color = "green",
                    this.snackbar = true;
                    this.load = true;
                    this.close();
                    this.readData(); //membaca data input
                    this.resetForm();
                })
                .catch((error) => {
                    this.error_message = error.response.data.message;
                    this.color = "red";
                    this.snackbar = true;
                    this.load = false;
                });
        },
        //menghapus data mobil
        deleteData(){
            //hapus data
            var url = this.$api + "/mobil/" + this.deleteId;
            this.load = true;
            this.$http
                .delete(url)
                .then((response)=> {
                    this.error_message = response.data.message;
                    this.color = "green",
                    this.snackbar = true;
                    this.load = false;
                    this.close();
                    this.readData(); //membaca data input
                    this.resetForm();
                    this.inputType = "Tambah";
                })
                .catch((error) => {
                    this.error_message = error.response.data.message;
                    this.color = "red";
                    this.snackbar = true;
                    this.load = false;
                });
        },
        editHandler(item){
            this.inputType = "Ubah";
            this.editId = item.id_mobil_sewa;
            var year, temp;
            this.form.nama_mobil_sewa = item.nama_mobil_sewa;
            this.form.tipe_mobil_sewa = item.tipe_mobil_sewa;
            this.form.jenis_transmisi = item.jenis_transmisi;
            this.form.jenis_bahan_bakar = item.jenis_bahan_bakar;
            this.form.warna_mobil_sewa = item.warna_mobil_sewa;
            this.form.volume_bagasi_mobil = item.volume_bagasi_mobil;
            this.form.fasilitas_mobil = item.fasilitas_mobil;
            this.form.harga_sewa_mobil = item.harga_sewa_mobil;
            this.form.kapasitas = item.kapasitas;
            this.form.plat_nomor = item.plat_nomor;
            this.form.no_stnk = item.no_stnk;
            if(item.kategori_aset == 0)
                this.form.kategori_aset = "Milik Perusahaan";
            else{
                this.form.kategori_aset = "Milik Mitra";
                this.show = true;
                this.date = item.periode_mulai_sewa.split("-");
                year = Number(this.date[0]);
                if(year<40) 
                    year = year + 2000;
                else
                    year = year + 1900;
                temp = year.toString() + "-" + this.date[1] + "-" + this.date[2];
                this.form.periode_mulai_sewa = temp;
                this.date = item.periode_akhir_sewa.split("-");
                year = Number(this.date[0]);
                if(year<40) 
                    year = year + 2000;
                else
                    year = year + 1900;
                temp = year.toString() + "-" + this.date[1] + "-" + this.date[2];
                this.form.periode_akhir_sewa = temp;
                this.form.nama_pemilik_mobil_sewa = item.pemilik_mobil.nama_pemilik_mobil_sewa;
            }
            this.date = item.tgl_terakhir_servis.split("-");
            year = Number(this.date[0]);
            if(year<40) 
                year = year + 2000;
            else
                year = year + 1900;
            temp = year.toString() + "-" + this.date[1] + "-" + this.date[2];
            this.form.tgl_terakhir_servis = temp;
            this.form.status_mobil = item.status_mobil;
            fetch(process.env.VUE_APP_AJAX_BASE_URL + "foto_mobil/" + item.foto_mobil)
                .then((response) => response.blob())
                .then((imageBlob) =>{
                    this.form.foto_mobil = imageBlob;
                    this.form.foto_mobil.name = item.foto_mobil;
                });
            this.preview_foto_mobil = this.url + "foto_mobil/" + item.foto_mobil;
            this.dialog = true;
        },
        editKontrak(item){
            this.editId = item.id_mobil_sewa;
            var year, temp;
            this.form.nama_mobil_sewa = item.nama_mobil_sewa;
            this.form.tipe_mobil_sewa = item.tipe_mobil_sewa;
            this.form.jenis_transmisi = item.jenis_transmisi;
            this.form.jenis_bahan_bakar = item.jenis_bahan_bakar;
            this.form.warna_mobil_sewa = item.warna_mobil_sewa;
            this.form.volume_bagasi_mobil = item.volume_bagasi_mobil;
            this.form.fasilitas_mobil = item.fasilitas_mobil;
            this.form.harga_sewa_mobil = item.harga_sewa_mobil;
            this.form.kapasitas = item.kapasitas;
            this.form.plat_nomor = item.plat_nomor;
            this.form.no_stnk = item.no_stnk;
            if(item.kategori_aset == 0)
                this.form.kategori_aset = "Milik Perusahaan";
            else{
                this.form.kategori_aset = "Milik Mitra";
                this.show = true;
                this.date = item.periode_mulai_sewa.split("-");
                year = Number(this.date[0]);
                if(year<40) 
                    year = year + 2000;
                else
                    year = year + 1900;
                temp = year.toString() + "-" + this.date[1] + "-" + this.date[2];
                this.form.periode_mulai_sewa = temp;
                this.date = item.periode_akhir_sewa.split("-");
                year = Number(this.date[0]);
                if(year<40) 
                    year = year + 2000;
                else
                    year = year + 1900;
                temp = year.toString() + "-" + this.date[1] + "-" + this.date[2];
                this.form.periode_akhir_sewa = temp;
                this.form.nama_pemilik_mobil_sewa = item.pemilik_mobil.nama_pemilik_mobil_sewa;
            }
            this.date = item.tgl_terakhir_servis.split("-");
            year = Number(this.date[0]);
            if(year<40) 
                year = year + 2000;
            else
                year = year + 1900;
            temp = year.toString() + "-" + this.date[1] + "-" + this.date[2];
            this.form.tgl_terakhir_servis = temp;
            this.form.status_mobil = item.status_mobil;
            fetch(process.env.VUE_APP_AJAX_BASE_URL + "foto_mobil/" + item.foto_mobil)
                .then((response) => response.blob())
                .then((imageBlob) =>{
                    this.form.foto_mobil = imageBlob;
                    this.form.foto_mobil.name = item.foto_mobil;
                });
            this.preview_foto_mobil = this.url + "foto_mobil/" + item.foto_mobil;
            this.dialogKontrak = true;
        },
        deleteHandler(id){
            this.deleteId = id;
            this.dialogConfirm = true;
        },
        close(){
            this.dialog = false;
            this.inputType = "Tambah";
            this.dialogConfirm = false;
            this.dialogKontrak = false;
            if(this.read == false) 
                this.readData();
            else
                this.readDataKontrak();
        },
        cancel(){
            this.resetForm();
            if(this.read == false) 
                this.readDataKontrak();
            else
                this.readData();
            this.dialog = false;
            this.dialogKontrak = false;
            this.dialogConfirm = false;
            this.inputType = "Tambah";
        },
        resetForm(){
            this.show = false;
            this.preview_foto_mobil = "";
            this.form = {
                nama_mobil_sewa: null,
                tipe_mobil_sewa: null,
                jenis_transmisi: null,
                jenis_bahan_bakar: null,
                warna_mobil_sewa: null,
                volume_bagasi_mobil: null,
                fasilitas_mobil: null,
                harga_sewa_mobil: null,
                kapasitas: null,
                plat_nomor: null,
                no_stnk: null,
                kategori_aset: null,
                tgl_terakhir_servis: null,
                status_mobil: null,
                foto_mobil: null,
                periode_mulai_sewa: null,
                periode_akhir_sewa: null,
                nama_pemilik_mobil_sewa: null,
            };
        },
        foto_mobil(image){
            if(!image){
                this.preview_foto_mobil = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) =>{
                this.preview_foto_mobil = e.target.result;
            };
            reader.readAsDataURL(image);
        },
        read_pemilik_mobil_id(){
            var url = this.$api + "/pemilik_mobil";
            this.$http.get(url).then((response) => {
                let temp = response.data.data;
                this.form_pemilik_mobil.id_pemilik_mobil_sewa = temp.map((v) => v.id_pemilik_mobil_sewa);
                this.form_pemilik_mobil.nama_pemilik_mobil_sewa = temp.map((v) => v.nama_pemilik_mobil_sewa);
                for(let i = 0; i<this.form_pemilik_mobil.nama_pemilik_mobil_sewa.length; i++){
                    this.pemilik_mobil.push(this.form_pemilik_mobil.nama_pemilik_mobil_sewa[i]);
                }
            });
        },
        kontrak(){
            if(this.form.kategori_aset == "Milik Perusahaan"){
                this.show = false;
            }
            else if(this.form.kategori_aset == "Milik Mitra"){
                this.show = true;
            }
        },
        saveKontrak(){
            var year, temp, id_pemilik_mobil_sewa = null, select = null;
            const formData = new FormData();
            temp = this.form.tgl_terakhir_servis;
            if(this.form.tgl_terakhir_servis != null){
                this.date = this.form.tgl_terakhir_servis.split("-");
                year = this.date[0].substr(2, 3);
                temp = year + "-" + this.date[1] + "-" + this.date[2];
                formData.append("tgl_terakhir_servis", temp);
            }
            else
                formData.append("tgl_terakhir_servis", "");
            if(this.form.nama_mobil_sewa != null)
                formData.append("nama_mobil_sewa", this.form.nama_mobil_sewa);
            else
                formData.append("nama_mobil_sewa", "");
            if(this.form.tipe_mobil_sewa != null)
                formData.append("tipe_mobil_sewa", this.form.tipe_mobil_sewa);
            else
                formData.append("tipe_mobil_sewa", "");
            if(this.form.jenis_transmisi != null)
                formData.append("jenis_transmisi", this.form.jenis_transmisi);
            else
                formData.append("jenis_transmisi", "");
            if(this.form.jenis_bahan_bakar != null)
                formData.append("jenis_bahan_bakar", this.form.jenis_bahan_bakar);
            else
                formData.append("jenis_bahan_bakar", "");
            if(this.form.warna_mobil_sewa != null)
                formData.append("warna_mobil_sewa", this.form.warna_mobil_sewa);
            else
                formData.append("warna_mobil_sewa", "");
            if(this.form.volume_bagasi_mobil != null)
                formData.append("volume_bagasi_mobil", this.form.volume_bagasi_mobil);
            else
                formData.append("volume_bagasi_mobil", "");
            if(this.form.fasilitas_mobil != null)
                formData.append("fasilitas_mobil", this.form.fasilitas_mobil);
            else
                formData.append("fasilitas_mobil", "");
            if(this.form.harga_sewa_mobil != null)
                formData.append("harga_sewa_mobil", this.form.harga_sewa_mobil);
            else
                formData.append("harga_sewa_mobil", "");
            if(this.form.kapasitas != null)
                formData.append("kapasitas", this.form.kapasitas);
            else
                formData.append("kapasitas", "");
            if(this.form.plat_nomor != null)
                formData.append("plat_nomor", this.form.plat_nomor);
            else
                formData.append("plat_nomor", "");
            if(this.form.no_stnk != null)
                formData.append("no_stnk", this.form.no_stnk);
            else
                formData.append("no_stnk", "")
            if(this.form.kategori_aset != null){
                if(this.form.kategori_aset == "Milik Perusahaan"){
                    formData.append("kategori_aset", 0);
                    formData.append("periode_mulai_sewa", "");
                    formData.append("periode_akhir_sewa", "");
                    formData.append("id_pemilik_mobil_sewa", "");
                }
                else{
                    formData.append("kategori_aset", 1);
                    temp = this.form.periode_mulai_sewa;
                    if(this.form.periode_mulai_sewa != null){
                        this.date = this.form.periode_mulai_sewa.split("-");
                        year = this.date[0].substr(2, 3);
                        temp = year + "-" + this.date[1] + "-" + this.date[2];
                        formData.append("periode_mulai_sewa", temp);
                    }
                    else
                        formData.append("periode_mulai_sewa", "");
                    temp = this.form.periode_akhir_sewa;
                    if(this.form.periode_akhir_sewa != null){
                        this.date = this.form.periode_akhir_sewa.split("-");
                        year = this.date[0].substr(2, 3);
                        temp = year + "-" + this.date[1] + "-" + this.date[2];
                        formData.append("periode_akhir_sewa", temp);
                    }
                    else
                        formData.append("periode_akhir_sewa", "");
                    if(this.form.nama_pemilik_mobil_sewa != null){
                        select = this.form.nama_pemilik_mobil_sewa;
                        for(let i = 0; i<this.form_pemilik_mobil.nama_pemilik_mobil_sewa.length; i++){
                            if(select.includes(this.form_pemilik_mobil.nama_pemilik_mobil_sewa[i])){
                                id_pemilik_mobil_sewa = this.form_pemilik_mobil.id_pemilik_mobil_sewa[i];
                                break;
                            }
                        }
                        formData.append("id_pemilik_mobil_sewa", id_pemilik_mobil_sewa);
                    }
                    else
                       formData.append("id_pemilik_mobil_sewa", ""); 
                }
            } 
            else
                formData.append("kategori_aset", "");
            if(this.form.status_mobil != null)
                formData.append("status_mobil", this.form.status_mobil);
            else
                formData.append("status_mobil", "");
            if(this.form.foto_mobil != null)
                formData.append("foto_mobil", this.form.foto_mobil);
            else
                formData.append("foto_mobil", "");

            var url = this.$api + "/mobil/" + this.editId;
            this.$http
                .post(url, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((response) => {
                    this.error_message = response.data.message;
                    this.color = "green",
                    this.snackbar = true;
                    this.load = true;
                    this.close();
                    this.readData(); //membaca data input
                    this.resetForm();
                })
                .catch((error) => {
                    this.error_message = error.response.data.message;
                    this.color = "red";
                    this.snackbar = true;
                    this.load = false;
                });
        }
    },
    computed: {
        formTitle(){
            return this.inputType;
        },
    },
    mounted(){
        this.readData();
        this.read_pemilik_mobil_id();
    },
};
</script>