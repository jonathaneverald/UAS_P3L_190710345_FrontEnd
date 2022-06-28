<template>
    <v-main class="driver">
        <h3 class="text-h3 font-weight-medium mb-5">Driver</h3>
        <v-card>
            <v-card-title>
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
                <v-spacer></v-spacer>
                <v-btn color="success" dark @click="dialog = true"><v-icon left>mdi-plus</v-icon>Tambah</v-btn>
            </v-card-title>

            <v-data-table :headers="headers" :items="drivers" :search="search">

                <template v-slot:[`item.pas_foto`]="{ item }">
                    <a :href="url + 'pas_foto/' + item.pas_foto" target="blank">
                        <v-img :src="url + 'pas_foto/' + item.pas_foto" contain width= "150px" height= "200px"></v-img>
                    </a>
                </template>
                <template v-slot:[`item.sim`]="{ item }">
                    <a :href="url + 'foto_sim/' + item.sim" target="blank">
                        <v-img :src="url + 'foto_sim/' + item.sim" contain width= "150px" height= "200px"></v-img>
                    </a>
                </template>
                <template v-slot:[`item.surat_bebas_napza`]="{ item }">
                    <a :href="url + 'surat_bebas_napza/' + item.surat_bebas_napza" target="blank">
                        <v-img :src="url + 'surat_bebas_napza/' + item.surat_bebas_napza" contain width= "150px" height= "200px"></v-img>
                    </a>
                </template>
                <template v-slot:[`item.surat_kesehatan_jiwa`]="{ item }">
                    <a :href="url + 'surat_kesehatan_jiwa/' + item.surat_kesehatan_jiwa" target="blank">
                        <v-img :src="url + 'surat_kesehatan_jiwa/' + item.surat_kesehatan_jiwa" contain width= "150px" height= "200px"></v-img>
                    </a>
                </template>
                <template v-slot:[`item.surat_kesehatan_jasmani`]="{ item }">
                    <a :href="url + 'surat_kesehatan_jasmani/' + item.surat_kesehatan_jasmani" target="blank">
                        <v-img :src="url + 'surat_kesehatan_jasmani/' + item.surat_kesehatan_jasmani" contain width= "150px" height= "200px"></v-img>
                    </a>
                </template>
                <template v-slot:[`item.skck`]="{ item }">
                    <a :href="url + 'skck/' + item.skck" target="blank">
                        <v-img :src="url + 'skck/' + item.skck" contain width= "150px" height= "200px"></v-img>
                    </a>
                </template>

                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn color="success" class="mr-2" @click="editHandler(item)"><v-icon left>mdi-pencil</v-icon>Edit</v-btn>
                    <v-btn color="error" @click="deleteHandler(item.id_driver)"><v-icon left>mdi-delete </v-icon>Delete</v-btn>
                </template>
            </v-data-table>

        </v-card>

        <v-dialog v-model="dialog" persistent width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ formTitle }} Driver</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-text-field v-model="form.nama_driver" label="Nama" required></v-text-field>   <!-- 17-33 kalau dicomment, tabel muncul-->
                        <v-textarea v-model="form.alamat_driver" label="Alamat" required></v-textarea>
                        <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px" min-width="auto">
                            <template v-slot:activator="{on, attrs}">
                                <v-text-field v-model="form.tanggal_lahir" label="Tanggal Lahir" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="form.tanggal_lahir" no-title @input="menu = false"></v-date-picker>
                        </v-menu>
                        <v-select v-model="form.jenis_kelamin" :items="['Pria', 'Wanita']" label="Jenis Kelamin"></v-select>
                        <v-text-field v-model="form.email" label="Email" required></v-text-field>
                        <v-text-field v-model="form.no_telp" label="Nomor Telepon" required></v-text-field>
                        <v-select v-model="form.bahasa" :items="['Bahasa Indonesia', 'Bahasa Inggris', 'Bahasa Indonesia dan Bahasa Inggris']" label="Bahasa" required></v-select>
                        <v-file-input v-model="form.pas_foto" accept="image/*" show-size label="Pas Foto" @change="pas_foto"/>
                        <v-img :src="preview_pas_foto" v-if="preview_pas_foto" width="200"></v-img>
                        <v-file-input v-model="form.sim" accept="image/*" show-size label="SIM" @change="sim"/>
                        <v-img :src="preview_sim" v-if="preview_sim" width="200"></v-img>
                        <v-file-input v-model="form.surat_bebas_napza" accept="image/*" show-size label="Surat Bebas Napza" @change="surat_bebas_napza"/>
                        <v-img :src="preview_surat_bebas_napza" v-if="preview_surat_bebas_napza" width="200"></v-img>
                        <v-file-input v-model="form.surat_kesehatan_jiwa" accept="image/*" show-size label="Surat Kesehatan Jiwa" @change="surat_kesehatan_jiwa"/>
                        <v-img :src="preview_surat_kesehatan_jiwa" v-if="preview_surat_kesehatan_jiwa" width="200"></v-img>
                        <v-file-input v-model="form.surat_kesehatan_jasmani" accept="image/*" show-size label="Surat Kesehatan Jasmani" @change="surat_kesehatan_jasmani"/>
                        <v-img :src="preview_surat_kesehatan_jasmani" v-if="preview_surat_kesehatan_jasmani" width="200"></v-img>
                        <v-file-input v-model="form.skck" accept="image/*" show-size label="SKCK" @change="skck"/>
                        <v-img :src="preview_skck" v-if="preview_skck" width="200"></v-img>
                        <v-text-field v-model="form.tarif_driver" label="Tarif Driver" required></v-text-field>
                        <v-select v-model="form.status_driver" :items="['Tersedia', 'Tidak Tersedia']" label="Status Driver" required></v-select>
                        <v-select v-model="form.status_dokumen" :items="['Lengkap', 'Tidak Lengkap']" label="Status Dokumen" required></v-select>
                        <v-text-field v-model="form.password" label="Password" required></v-text-field>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="cancel">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="setForm">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogConfirm" persistent max-width="400px">
            <v-card>
                <v-card-title>
                    <span class="headline">Warning!</span>
                </v-card-title>
                <v-card-text>Anda yakin ingin menghapus Driver ini?</v-card-text>
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
    name: "AdminDriver",
    data(){
        return{
            inputType: "Tambah",
            load: false,
            snackbar: false,
            error_message: "",
            color: "",
            search: null,
            dialog: false,
            dialogConfirm: false,
            headers:[
                { text: "ID Driver", align: "start", sortable: true, value: "format_id_driver" },
                { text: "Nama Driver", value: "nama_driver" },
                { text: "Alamat", value: "alamat_driver" },
                { text: "Tanggal Lahir", value: "tanggal_lahir" },
                { text: "Jenis Kelamin", value: "jenis_kelamin" },
                { text: "Email", value: "email" },
                { text: "Nomor Telepon", value: "no_telp" },
                { text: "Bahasa", value: "bahasa" },
                { text: "Pas Foto", value: "pas_foto" },
                { text: "SIM", value: "sim" },
                { text: "Surat Bebas Napza", value: "surat_bebas_napza" },
                { text: "Surat Kesehatan Jiwa", value: "surat_kesehatan_jiwa" },
                { text: "Surat Kesehatan Jasmani", value: "surat_kesehatan_jasmani" },
                { text: "SKCK", value: "skck" },
                { text: "Tarif Driver", value: "tarif_driver" },
                { text: "Status Driver", value: "status_driver" },
                { text: "Status Dokumen", value: "status_dokumen" },
                { text: "Password", value: "password" },
                { text: "Actions", value: "actions" },
            ],
            drivers: [],
            form: {
                nama_driver: null,
                alamat_driver: null,
                tanggal_lahir: null,
                jenis_kelamin: null,
                email: null,
                no_telp: null,
                bahasa: null,
                pas_foto: null,
                sim: null,
                surat_bebas_napza: null,
                surat_kesehatan_jiwa: null,
                surat_kesehatan_jasmani: null,
                skck: null,
                tarif_driver: null,
                status_driver: null,
                status_dokumen: null,
                password: null,
            },
            show: false,
            deleteId: "",
            editId: "",
            menu: false,
            date: "",
            preview_pas_foto: "",
            preview_sim: "",
            preview_surat_bebas_napza: "",
            preview_surat_kesehatan_jiwa: "",
            preview_surat_kesehatan_jasmani: "",
            preview_skck: "",
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
        //read data drivers
        readData(){
            var url = this.$api + "/driver";
            this.$http.get(url).then((response) => {
                this.drivers = response.data.data;
            });
        },
        //simpan data driver
        save(){
            this.load = true;
            var year, temp;
            const formData = new FormData();
            temp = this.form.tanggal_lahir;
            if(this.form.tanggal_lahir != null){
                this.date = this.form.tanggal_lahir.split("-");
                year = this.date[0].substr(2, 3);
                temp = year + "-" + this.date[1] + "-" + this.date[2];
                formData.append("tanggal_lahir", temp);
            }
            else
                formData.append("tanggal_lahir", "");
            if(this.form.nama_driver != null)
                formData.append("nama_driver", this.form.nama_driver);
            else
                formData.append("nama_driver", "");
            if(this.form.alamat_driver != null)
                formData.append("alamat_driver", this.form.alamat_driver);
            else
                formData.append("alamat_driver", "");
            if(this.form.jenis_kelamin != null)
                formData.append("jenis_kelamin", this.form.jenis_kelamin);
            else
                formData.append("jenis_kelamin", "");
            if(this.form.email != null)
                formData.append("email", this.form.email);
            else
                formData.append("email", "");
            if(this.form.no_telp != null)
                formData.append("no_telp", this.form.no_telp);
            else
                formData.append("no_telp", "");
            if(this.form.bahasa != null)
                formData.append("bahasa", this.form.bahasa);
            else
                formData.append("bahasa", "");
            if(this.form.pas_foto != null)
                formData.append("pas_foto", this.form.pas_foto);
            else
                formData.append("pas_foto", "");
            if(this.form.sim != null)
                formData.append("sim", this.form.sim);
            else
                formData.append("sim", "");
            if(this.form.surat_bebas_napza != null)
                formData.append("surat_bebas_napza", this.form.surat_bebas_napza);
            else
                formData.append("surat_bebas_napza", "");
            if(this.form.surat_kesehatan_jiwa != null)
                formData.append("surat_kesehatan_jiwa", this.form.surat_kesehatan_jiwa);
            else
                formData.append("surat_kesehatan_jiwa", "");
            if(this.form.surat_kesehatan_jasmani != null)
                formData.append("surat_kesehatan_jasmani", this.form.surat_kesehatan_jasmani);
            else
                formData.append("surat_kesehatan_jasmani", "");
            if(this.form.skck != null)
                formData.append("skck", this.form.skck);
            else
                formData.append("skck", "");
            if(this.form.tarif_driver != null)
                formData.append("tarif_driver", this.form.tarif_driver);
            else
                formData.append("tarif_driver", "");
            if(this.form.status_driver != null)
                formData.append("status_driver", this.form.status_driver);
            else
                formData.append("status_driver", "");
            if(this.form.status_dokumen != null)
                formData.append("status_dokumen", this.form.status_dokumen);
            else
                formData.append("status_dokumen", "");

            this.$http
                .post(this.$api + "/driver", formData, {
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
        //mengubah data customer
        update(){
            var year, temp;
            const formData = new FormData();
            temp = this.form.tanggal_lahir;
            if(this.form.tanggal_lahir != null){
                this.date = this.form.tanggal_lahir.split("-");
                year = this.date[0].substr(2, 3);
                temp = year + "-" + this.date[1] + "-" + this.date[2];
                formData.append("tanggal_lahir", temp);
            }
            else
                formData.append("tanggal_lahir", "");
            if(this.form.nama_driver != null)
                formData.append("nama_driver", this.form.nama_driver);
            else
                formData.append("nama_driver", "");
            if(this.form.alamat_driver != null)
                formData.append("alamat_driver", this.form.alamat_driver);
            else
                formData.append("alamat_driver", "");
            if(this.form.jenis_kelamin != null)
                formData.append("jenis_kelamin", this.form.jenis_kelamin);
            else
                formData.append("jenis_kelamin", "");
            if(this.form.email != null)
                formData.append("email", this.form.email);
            else
                formData.append("email", "");
            if(this.form.no_telp != null)
                formData.append("no_telp", this.form.no_telp);
            else
                formData.append("no_telp", "");
            if(this.form.bahasa != null)
                formData.append("bahasa", this.form.bahasa);
            else
                formData.append("bahasa", "");
            if(this.form.pas_foto != null)
                formData.append("pas_foto", this.form.pas_foto);
            else
                formData.append("pas_foto", "");
            if(this.form.sim != null)
                formData.append("sim", this.form.sim);
            else
                formData.append("sim", "");
            if(this.form.surat_bebas_napza != null)
                formData.append("surat_bebas_napza", this.form.surat_bebas_napza);
            else
                formData.append("surat_bebas_napza", "");
            if(this.form.surat_kesehatan_jiwa != null)
                formData.append("surat_kesehatan_jiwa", this.form.surat_kesehatan_jiwa);
            else
                formData.append("surat_kesehatan_jiwa", "");
            if(this.form.surat_kesehatan_jasmani != null)
                formData.append("surat_kesehatan_jasmani", this.form.surat_kesehatan_jasmani);
            else
                formData.append("surat_kesehatan_jasmani", "");
            if(this.form.skck != null)
                formData.append("skck", this.form.skck);
            else
                formData.append("skck", "");
            if(this.form.tarif_driver != null)
                formData.append("tarif_driver", this.form.tarif_driver);
            else
                formData.append("tarif_driver", "");
            if(this.form.status_driver != null)
                formData.append("status_driver", this.form.status_driver);
            else
                formData.append("status_driver", "");
            if(this.form.status_dokumen != null)
                formData.append("status_dokumen", this.form.status_dokumen);
            else
                formData.append("status_dokumen", "");
            if(this.form.password != null)
                formData.append("password", this.form.password);
            else
                formData.append("password", "");

            var url = this.$api + "/driver/" + this.editId;
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
        //menghapus data driver
        deleteData(){
            //hapus data
            var url = this.$api + "/driver/" + this.deleteId;
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
            this.editId = item.id_driver;
            var year, temp;
            this.form.nama_driver = item.nama_driver;
            this.form.alamat_driver = item.alamat_driver;
            this.date = item.tanggal_lahir.split("-");
            year = Number(this.date[0]);
            if(year<40) 
                year = year + 2000;
            else
                year = year + 1900;
            temp = year.toString() + "-" + this.date[1] + "-" + this.date[2];
            this.form.tanggal_lahir = temp;
            this.form.jenis_kelamin = item.jenis_kelamin;
            this.form.email = item.email;
            this.form.no_telp = item.no_telp;
            this.form.bahasa = item.bahasa;
            fetch(process.env.VUE_APP_AJAX_BASE_URL + "pas_foto/" + item.pas_foto)
                .then((response) => response.blob())
                .then((imageBlob) =>{
                    this.form.pas_foto = imageBlob;
                    this.form.pas_foto.name = item.pas_foto;
                });
            fetch(process.env.VUE_APP_AJAX_BASE_URL + "foto_sim/" + item.sim)
                .then((response) => response.blob())
                .then((imageBlob) =>{
                    this.form.sim = imageBlob;
                    this.form.sim.name = item.sim;
                });
            fetch(process.env.VUE_APP_AJAX_BASE_URL + "surat_bebas_napza/" + item.surat_bebas_napza)
                .then((response) => response.blob())
                .then((imageBlob) =>{
                    this.form.surat_bebas_napza = imageBlob;
                    this.form.surat_bebas_napza.name = item.surat_bebas_napza;
                });
            fetch(process.env.VUE_APP_AJAX_BASE_URL + "surat_kesehatan_jiwa/" + item.surat_kesehatan_jiwa)
                .then((response) => response.blob())
                .then((imageBlob) =>{
                    this.form.surat_kesehatan_jiwa = imageBlob;
                    this.form.surat_kesehatan_jiwa.name = item.surat_kesehatan_jiwa;
                });
            fetch(process.env.VUE_APP_AJAX_BASE_URL + "surat_kesehatan_jasmani/" + item.surat_kesehatan_jasmani)
                .then((response) => response.blob())
                .then((imageBlob) =>{
                    this.form.surat_kesehatan_jasmani = imageBlob;
                    this.form.surat_kesehatan_jasmani.name = item.surat_kesehatan_jasmani;
                });
            fetch(process.env.VUE_APP_AJAX_BASE_URL + "skck/" + item.skck)
                .then((response) => response.blob())
                .then((imageBlob) =>{
                    this.form.skck = imageBlob;
                    this.form.skck.name = item.skck;
                });
            this.preview_pas_foto = this.url + "pas_foto/" + item.pas_foto;
            this.preview_sim = this.url + "foto_sim/" + item.sim;
            this.preview_surat_bebas_napza = this.url + "surat_bebas_napza/" + item.surat_bebas_napza;
            this.preview_surat_kesehatan_jiwa = this.url + "surat_kesehatan_jiwa/" + item.surat_kesehatan_jiwa;
            this.preview_surat_kesehatan_jasmani = this.url + "surat_kesehatan_jasmani/" + item.surat_kesehatan_jasmani;
            this.preview_skck = this.url + "skck/" + item.skck;
            this.form.tarif_driver = item.tarif_driver;
            this.form.status_driver = item.status_driver;
             this.form.status_dokumen = item.status_dokumen;
            this.form.password = item.password;
            this.dialog = true;
        },
        deleteHandler(id){
            this.deleteId = id;
            this.dialogConfirm = true;
        },
        close(){
            this.dialog = false;
            this.inputType = "Tambah";
            this.dialogConfirm = false;
            this.readData();
        },
        cancel(){
            this.resetForm();
            this.readData();
            this.dialog = false;
            this.dialogConfirm = false;
            this.inputType = "Tambah";
        },
        resetForm(){
            this.show = false;
            this.preview_pas_foto = "";
            this.preview_sim = "";
            this.preview_surat_bebas_napza = "";
            this.preview_surat_kesehatan_jiwa = "";
            this.preview_surat_kesehatan_jasmani = "";
            this.preview_skck = "";
            this.form = {
                nama_driver: null,
                alamat_driver: null,
                tanggal_lahir: null,
                jenis_kelamin: null,
                email: null,
                no_telp: null,
                bahasa: null,
                pas_foto: null,
                sim: null,
                surat_bebas_napza: null,
                surat_kesehatan_jiwa: null,
                surat_kesehatan_jasmani: null,
                skck: null,
                tarif_driver: null,
                status_driver: null,
                status_dokumen: null,
                password: null,
            };
        },
        pas_foto(image){
            if(!image){
                this.preview_pas_foto = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) =>{
                this.preview_pas_foto = e.target.result;
            };
            reader.readAsDataURL(image);
        },
        sim(image){
            if(!image){
                this.preview_sim = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) =>{
                this.preview_sim = e.target.result;
            };
            reader.readAsDataURL(image);
        },
        surat_bebas_napza(image){
            if(!image){
                this.preview_surat_bebas_napza = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) =>{
                this.preview_surat_bebas_napza = e.target.result;
            };
            reader.readAsDataURL(image);
        },
        surat_kesehatan_jiwa(image){
            if(!image){
                this.preview_surat_kesehatan_jiwa = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) =>{
                this.preview_surat_kesehatan_jiwa = e.target.result;
            };
            reader.readAsDataURL(image);
        },
        surat_kesehatan_jasmani(image){
            if(!image){
                this.preview_surat_kesehatan_jasmani = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) =>{
                this.preview_surat_kesehatan_jasmani = e.target.result;
            };
            reader.readAsDataURL(image);
        },
        skck(image){
            if(!image){
                this.preview_skck = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) =>{
                this.preview_skck = e.target.result;
            };
            reader.readAsDataURL(image);
        },
    },
    computed: {
        formTitle(){
            return this.inputType;
        },
    },
    mounted(){
        this.readData();
    },
};
</script>