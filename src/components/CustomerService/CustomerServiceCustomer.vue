<template>
    <v-main class="customer">
        <h3 class="text-h3 font-weight-medium mb-5">Customer</h3>
        <v-card>
            <v-card-title>
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
                <v-spacer></v-spacer>
                <v-btn color="success" dark @click="dialog = true"><v-icon left>mdi-plus</v-icon>Tambah</v-btn>
            </v-card-title>

            <v-data-table :headers="headers" :items="customers" :search="search">

                <template v-slot:[`item.foto_sim`]="{ item }">
                    <a :href="url + 'foto_sim/' + item.foto_sim" target="blank">
                        <v-img :src="url + 'foto_sim/' + item.foto_sim" contain width= "150px" height= "200px"></v-img>
                    </a>
                </template>
                <template v-slot:[`item.dokumen_persyaratan`]="{ item }">
                    <a :href="url + 'dokumen_persyaratan/' + item.dokumen_persyaratan" target="blank">
                        <v-img :src="url + 'dokumen_persyaratan/' + item.dokumen_persyaratan" contain width= "150px" height= "200px"></v-img>
                    </a>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn color="success" class="mr-2" @click="editHandler(item)"><v-icon left>mdi-pencil</v-icon>Edit</v-btn>
                    <v-btn color="error" @click="deleteHandler(item.id_customer)"><v-icon left>mdi-delete </v-icon>Delete</v-btn>
                </template>
            </v-data-table>

        </v-card>

        <v-dialog v-model="dialog" persistent width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ formTitle }} Customer</span>
                </v-card-title> 
                <v-card-text>
                    <v-container>
                        <v-text-field v-model="form.nama_customer" label="Nama" required></v-text-field>   
                        <v-textarea v-model="form.alamat_customer" label="Alamat" required></v-textarea>
                        <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px" min-width="auto">
                            <template v-slot:activator="{on, attrs}">
                                <v-text-field v-model="form.tanggal_lahir" label="Tanggal Lahir" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="form.tanggal_lahir" no-title @input="menu = false"></v-date-picker>
                        </v-menu>
                        <v-select v-model="form.jenis_kelamin" :items="['Pria', 'Wanita']" label="Jenis Kelamin"></v-select>
                        <v-text-field v-model="form.email" label="Email" required></v-text-field>
                        <v-text-field v-model="form.no_telp" label="Nomor Telepon" required></v-text-field>
                        <v-select v-model="form.tanda_pengenal" :items="['KTP', 'SIM']" label="Tanda Pengenal" required></v-select>
                        <v-file-input v-model="form.foto_sim" accept="image/*" show-size label="Foto SIM" @change="foto_sim"/>
                        <v-img :src="preview_foto_sim" v-if="preview_foto_sim" width="200"></v-img>
                        <v-file-input v-model="form.dokumen_persyaratan" accept="image/*" show-size label="Dokumen Persyaratan" @change="dokumen_persyaratan"/>
                        <v-img :src="preview_dokumen_persyaratan" v-if="preview_dokumen_persyaratan" width="200"></v-img>
                        <v-select v-model="form.status_dokumen" :items="['Dalam Proses', 'Tidak Lengkap', 'Lengkap']" label="Status Dokumen"></v-select>
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
                <v-card-text>Anda yakin ingin menghapus Customer ini?</v-card-text>
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
    name: "CustomerServiceCustomer",
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
                { text: "ID Customer", align: "start", sortable: true, value: "format_id_customer" },
                { text: "Nama", value: "nama_customer" },
                { text: "Alamat", value: "alamat_customer" },
                { text: "Tanggal Lahir", value: "tanggal_lahir" },
                { text: "Jenis Kelamin", value: "jenis_kelamin" },
                { text: "Email", value: "email" },
                { text: "Nomor Telepon", value: "no_telp" },
                { text: "Tanda Pengenal", value: "tanda_pengenal" },
                { text: "SIM", value: "foto_sim" },
                { text: "Dokumen Persyaratan", value: "dokumen_persyaratan" },
                { text: "Status Dokumen", value: "status_dokumen" },
                { text: "Password", value: "password" },
                { text: "Actions", value: "actions" },
            ],
            customers: [],
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
            show: false,
            deleteId: "",
            editId: "",
            menu: false,
            date: "",
            preview_foto_sim: "",
            preview_dokumen_persyaratan: "",
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
        //read data customers
        readData(){
            var url = this.$api + "/customer";
            this.$http.get(url).then((response) => {
                this.customers = response.data.data;
            });
        },
        //simpan data customer
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
            if(this.form.nama_customer != null)
                formData.append("nama_customer", this.form.nama_customer);
            else
                formData.append("nama_customer", "");
            if(this.form.alamat_customer != null)
                formData.append("alamat_customer", this.form.alamat_customer);
            else
                formData.append("alamat_customer", "");
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
            if(this.form.tanda_pengenal != null)
                formData.append("tanda_pengenal", this.form.tanda_pengenal);
            else
                formData.append("tanda_pengenal", "");
            if(this.form.foto_sim != null)
                formData.append("foto_sim", this.form.foto_sim);
            else
                formData.append("foto_sim", "");
            if(this.form.dokumen_persyaratan != null)
                formData.append("dokumen_persyaratan", this.form.dokumen_persyaratan);
            else
                formData.append("dokumen_persyaratan", "");
            if(this.form.status_dokumen != null)
                formData.append("status_dokumen", this.form.status_dokumen);
            else
                formData.append("status_dokumen", "");

            this.$http
                .post(this.$api + "/customer", formData, {
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
            if(this.form.nama_customer != null)
                formData.append("nama_customer", this.form.nama_customer);
            else
                formData.append("nama_customer", "");
            if(this.form.alamat_customer != null)
                formData.append("alamat_customer", this.form.alamat_customer);
            else
                formData.append("alamat_customer", "");
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
            if(this.form.tanda_pengenal != null)
                formData.append("tanda_pengenal", this.form.tanda_pengenal);
            else
                formData.append("tanda_pengenal", "");
            if(this.form.foto_sim != null)
                formData.append("foto_sim", this.form.foto_sim);
            else
                formData.append("foto_sim", "");
            if(this.form.dokumen_persyaratan != null)
                formData.append("dokumen_persyaratan", this.form.dokumen_persyaratan);
            else
                formData.append("dokumen_persyaratan", "");
            if(this.form.status_dokumen != null)
                formData.append("status_dokumen", this.form.status_dokumen);
            else
                formData.append("status_dokumen", "");
            if(this.form.password != null)
                formData.append("password", this.form.password);
            else
                formData.append("password", "");

            var url = this.$api + "/customer/" + this.editId;
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
        //menghapus data customer
        deleteData(){
            //hapus data
            var url = this.$api + "/customer/" + this.deleteId;
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
            this.editId = item.id_customer;
            var year, temp;
            this.form.nama_customer = item.nama_customer;
            this.form.alamat_customer = item.alamat_customer;
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
            this.form.tanda_pengenal = item.tanda_pengenal;
            fetch(process.env.VUE_APP_AJAX_BASE_URL + "foto_sim/" + item.foto_sim)
                .then((response) => response.blob())
                .then((imageBlob) =>{
                    this.form.foto_sim = imageBlob;
                    this.form.foto_sim.name = item.foto_sim;
                });
            fetch(process.env.VUE_APP_AJAX_BASE_URL + "dokumen_persyaratan/" + item.dokumen_persyaratan)
                .then((response) => response.blob())
                .then((imageBlob) =>{
                    this.form.dokumen_persyaratan = imageBlob;
                    this.form.dokumen_persyaratan.name = item.dokumen_persyaratan;
                });
            this.status_dokumen = item.status_dokumen;
            this.preview_foto_sim = this.url + "foto_sim/" + item.foto_sim;
            this.preview_dokumen_persyaratan = this.url + "dokumen_persyaratan/" + item.dokumen_persyaratan;
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
            this.preview_foto_sim = "";
            this.preview_dokumen_persyaratan = "";
            this.form = {
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
            };
        },
        foto_sim(image){
            if(!image){
                this.preview_foto_sim = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) =>{
                this.preview_foto_sim = e.target.result;
            };
            reader.readAsDataURL(image);
        },
        dokumen_persyaratan(image){
            if(!image){
                this.preview_dokumen_persyaratan = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) =>{
                this.preview_dokumen_persyaratan = e.target.result;
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