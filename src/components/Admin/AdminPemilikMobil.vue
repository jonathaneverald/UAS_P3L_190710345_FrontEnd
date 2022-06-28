<template>
    <v-main class="pemilik_mobil">
        <h3 class="text-h3 font-weight-medium mb-5">Pemilik Mobil</h3>
        <v-card>
            <v-card-title>
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
                <v-spacer></v-spacer>
                <v-btn color="success" dark @click="dialog = true"><v-icon left>mdi-plus</v-icon>Tambah</v-btn>
            </v-card-title>

            <v-data-table :headers="headers" :items="pemilik_mobils" :search="search">
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn color="success" class="mr-2" @click="editHandler(item)"><v-icon left>mdi-pencil</v-icon>Edit</v-btn>
                    <v-btn color="error" @click="deleteHandler(item.id_pemilik_mobil_sewa)"><v-icon left>mdi-delete </v-icon>Delete</v-btn>
                </template>
            </v-data-table>

        </v-card>

        <v-dialog v-model="dialog" persistent width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ formTitle }} Pemilik Mobil</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-text-field v-model="form.nama_pemilik_mobil_sewa" label="Nama Pemilik" required></v-text-field>
                        <v-text-field v-model="form.no_ktp" label="Nomor KTP" required></v-text-field>
                        <v-text-field v-model="form.no_hp" label="Nomor HP" required></v-text-field>
                        <v-textarea v-model="form.alamat" label="Alamat" required></v-textarea>
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
                <v-card-text>Anda yakin ingin menghapus Pemilik Mobil ini?</v-card-text>
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
    name: "AdminPemilikMobil",
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
                { text: "Nama Pemilik Mobil", align: "start", sortable: true, value: "nama_pemilik_mobil_sewa" },
                { text: "Nomor KTP", value: "no_ktp" },
                { text: "Nomor HP", value: "no_hp" },
                { text: "Alamat", value: "alamat" },
                { text: "Actions", value: "actions" },
            ],
            pemilik_mobils: [],
            form: {
                nama_pemilik_mobil_sewa: null,
                no_ktp: null,
                no_hp: null,
                alamat: null,
            },
            deleteId: "",
            editId: "",
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
        //read data pemilik mobil
        readData(){
            var url = this.$api + "/pemilik_mobil";
            this.$http.get(url).then((response) => {
                this.pemilik_mobils = response.data.data;
            });
        },
        //simpan data pemilik mobil
        save(){
            this.load = true;
            this.$http
                .post(this.$api + "/pemilik_mobil", {
                    nama_pemilik_mobil_sewa: this.form.nama_pemilik_mobil_sewa,
                    no_ktp: this.form.no_ktp,
                    no_hp: this.form.no_hp,
                    alamat: this.form.alamat,
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
        //mengubah data pemilik mobil
        update(){
            let newData = {
                nama_pemilik_mobil_sewa: this.form.nama_pemilik_mobil_sewa,
                no_ktp: this.form.no_ktp,
                no_hp: this.form.no_hp,
                alamat: this.form.alamat,
            };
            var url = this.$api + "/pemilik_mobil/" + this.editId;
            this.load = true;
            this.$http
                .put(url, newData)
                .then((response) => {
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
        //menghapus data pemilik mobil
        deleteData(){
            //hapus data
            var url = this.$api + "/pemilik_mobil/" + this.deleteId;
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
            this.editId = item.id_pemilik_mobil_sewa;
            this.form.nama_pemilik_mobil_sewa = item.nama_pemilik_mobil_sewa;
            this.form.no_ktp = item.no_ktp;
            this.form.no_hp = item.no_hp;
            this.form.alamat = item.alamat;
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
            this.form = {
                nama_pemilik_mobil_sewa: null,
                no_ktp: null,
                no_hp: null,
                alamat: null,
            };
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