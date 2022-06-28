<template>
    <v-main class="pegawai">
        <h3 class="text-h3 font-weight-medium mb-5">Pegawai</h3>
        <v-card>
            <v-card-title>
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
                <v-spacer></v-spacer>
                <v-btn color="success" dark @click="dialog = true"><v-icon left>mdi-plus</v-icon>Tambah</v-btn>
            </v-card-title>

            <v-data-table :headers="headers" :items="pegawais" :search="search">

                <template v-slot:[`item.pas_foto`]="{ item }">
                    <a :href="url + 'pas_foto/' + item.pas_foto" target="blank">
                        <v-img :src="url + 'pas_foto/' + item.pas_foto" contain width= "150px" height= "200px"></v-img>
                    </a>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn color="success" class="mr-2" @click="editHandler(item)"><v-icon left>mdi-pencil</v-icon>Edit</v-btn>
                    <v-btn color="error" @click="deleteHandler(item.id_pegawai)"><v-icon left>mdi-delete </v-icon>Delete</v-btn>
                </template>
            </v-data-table>

        </v-card>

        <v-dialog v-model="dialog" persistent width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ formTitle }} Pegawai</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-text-field v-model="form.nama_pegawai" label="Nama" required></v-text-field>   <!-- 17-33 kalau dicomment, tabel muncul-->
                        <v-textarea v-model="form.alamat" label="Alamat" required></v-textarea>
                        <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y max-width="290px" min-width="auto">
                            <template v-slot:activator="{on, attrs}">
                                <v-text-field v-model="form.tanggal_lahir" label="Tanggal Lahir" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="form.tanggal_lahir" no-title @input="menu = false"></v-date-picker>
                        </v-menu>
                        <v-select v-model="form.jenis_kelamin" :items="['Pria', 'Wanita']" label="Jenis Kelamin"></v-select>
                        <v-text-field v-model="form.email" label="Email" required></v-text-field>
                        <v-text-field v-model="form.no_telp" label="Nomor Telepon" required></v-text-field>
                        <v-file-input v-model="form.pas_foto" accept="image/*" show-size label="Pas Foto" @change="pas_foto"/>
                        <v-img :src="preview_pas_foto" v-if="preview_pas_foto" width="200"></v-img>
                        <v-select v-model="form.jabatan" :items="role" label="Jabatan" required></v-select>
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
                <v-card-text>Anda yakin ingin menghapus Pegawai ini?</v-card-text>
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
    name: "AdminPegawai",
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
                { text: "Nama", align: "start", sortable: true, value: "nama_pegawai" },
                { text: "Alamat", value: "alamat" },
                { text: "Tanggal Lahir", value: "tanggal_lahir" },
                { text: "Jenis Kelamin", value: "jenis_kelamin" },
                { text: "Email", value: "email" },
                { text: "Nomor Telepon", value: "no_telp" },
                { text: "Pas Foto", value: "pas_foto" },
                { text: "Jabatan", value: "role.jabatan" },
                { text: "Password", value: "password" },
                { text: "Actions", value: "actions" },
            ],
            pegawais: [],
            role: [],
            form: {
                nama_pegawai: null,
                alamat: null,
                tanggal_lahir: null,
                jenis_kelamin: null,
                email: null,
                no_telp: null,
                pas_foto: null,
                jabatan: null,
                password: null,
            },
            formRole: {
                id_role: null,
                jabatan: null,
            },

            show: false,
            deleteId: "",
            editId: "",
            menu: false,
            date: "",
            preview_pas_foto: "",
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
        //read data pegawais
        readData(){
            var url = this.$api + "/pegawai";
            this.$http.get(url).then((response) => {
                this.pegawais = response.data.data;
            });
        },
        //simpan data pegawai
        save(){
            this.load = true;
            var year, temp, id_role = null, select = null;
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
            if(this.form.nama_pegawai != null)
                formData.append("nama_pegawai", this.form.nama_pegawai);
            else
                formData.append("nama_pegawai", "");
            if(this.form.alamat != null)
                formData.append("alamat", this.form.alamat);
            else
                formData.append("alamat", "");
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
            if(this.form.pas_foto != null)
                formData.append("pas_foto", this.form.pas_foto);
            else
                formData.append("pas_foto", "");
            if(this.form.jabatan != null){
                select = this.form.jabatan;
                for(let i = 0; i< this.formRole.jabatan.length; i++){
                    if(select.includes(this.formRole.jabatan[i])){
                        id_role = this.formRole.id_role[i];
                        break;
                    }
                }
                formData.append("id_role", id_role)
            }
            else
                formData.append("id_role", "");

            this.$http
                .post(this.$api + "/pegawai", formData, {
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
        //mengubah data pegawai
        update(){
            var year, temp, id_role = null, select = null;
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
            if(this.form.nama_pegawai != null)
                formData.append("nama_pegawai", this.form.nama_pegawai);
            else
                formData.append("nama_pegawai", "");
            if(this.form.alamat != null)
                formData.append("alamat", this.form.alamat);
            else
                formData.append("alamat", "");
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
            if(this.form.pas_foto != null)
                formData.append("pas_foto", this.form.pas_foto);
            else
                formData.append("pas_foto", "");
            if(this.form.jabatan != null){
                select = this.form.jabatan;
                for(let i = 0; i< this.formRole.jabatan.length; i++){
                    if(select.includes(this.formRole.jabatan[i])){
                        id_role = this.formRole.id_role[i];
                        break;
                    }
                }
                formData.append("id_role", id_role)
            }
            else
                formData.append("id_role", "");
            if(this.form.password != null)
                formData.append("password", this.form.password);
            else
                formData.append("password", "");

            var url = this.$api + "/pegawai/" + this.editId;
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
        //menghapus data pegawai
        deleteData(){
            //hapus data
            var url = this.$api + "/pegawai/" + this.deleteId;
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
            this.show = true;
            this.inputType = "Ubah";
            this.editId = item.id_pegawai;
            var year, temp;
            this.form.nama_pegawai = item.nama_pegawai;
            this.form.alamat = item.alamat;
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
            fetch(process.env.VUE_APP_AJAX_BASE_URL + "pas_foto/" + item.pas_foto)
                .then((response) => response.blob())
                .then((imageBlob) =>{
                    this.form.pas_foto = imageBlob;
                    this.form.pas_foto.name = item.pas_foto;
                });
            this.preview_pas_foto = this.url + "pas_foto/" + item.pas_foto;
            this.form.jabatan = item.role.jabatan;
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
            this.form = {
                nama_pegawai: null,
                alamat: null,
                tanggal_lahir: null,
                jenis_kelamin: null,
                email: null,
                no_telp: null,
                pas_foto: null,
                jabatan: null,
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
        read_role_id(){
            var url = this.$api + "/role";
            this.$http.get(url).then((response) => {
                let temp = response.data.data;
                this.formRole.id_role = temp.map((v) => v.id_role);
                this.formRole.jabatan = temp.map((v) => v.jabatan);
                for(let i = 0; i<this.formRole.jabatan.length; i++){
                    this.role.push(this.formRole.jabatan[i]);
                }
            });
        },
    },
    computed: {
        formTitle(){
            return this.inputType;
        },
    },
    mounted(){
        this.readData();
        this.read_role_id();
    },
};
</script>