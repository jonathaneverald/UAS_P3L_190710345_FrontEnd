<template>
    <v-main class="promo">
        <h3 class="text-h3 font-weight-medium mb-5">Promo</h3>
        <v-card>
            <v-card-title>
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
                <v-spacer></v-spacer>
                <v-btn color="success" dark @click="dialog = true"><v-icon left>mdi-plus</v-icon>Tambah</v-btn>
            </v-card-title>

            <v-data-table :headers="headers" :items="promos" :search="search">
                <template v-slot:[`item.status_promo`]="{ item }">
                    <div v-if="item.status_promo === 1">Aktif</div>
                    <div v-else>Tidak Aktif</div>
                </template>

                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn color="success" class="mr-2" @click="editHandler(item)"><v-icon left>mdi-pencil</v-icon>Edit</v-btn>
                    <v-btn color="error" @click="deleteHandler(item.id_promo)"><v-icon left>mdi-delete </v-icon>Delete</v-btn>
                </template>
            </v-data-table>

        </v-card>

        <v-dialog v-model="dialog" persistent width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ formTitle }} Promo</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-text-field v-model="form.kode_promo" label="Kode Promo" required></v-text-field>
                        <v-text-field v-model="form.jenis_promo" label="Jenis Promo" required></v-text-field>
                        <v-textarea v-model="form.keterangan_promo" label="Keterangan Promo" required></v-textarea>
                        <v-text-field v-model="form.potongan_promo" label="Potongan Promo" required></v-text-field>
                        <v-select v-model="form.status_promo" :items="['Aktif', 'Tidak Aktif']" label="Status Promo" required></v-select>
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
                <v-card-text>Anda yakin ingin menghapus Promo ini?</v-card-text>
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
    name: "ManagerPromo",
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
                { text: "Kode Promo", align: "start", sortable: true, value: "kode_promo" },
                { text: "Jenis Promo", value: "jenis_promo" },
                { text: "Keterangan Promo", value: "keterangan_promo" },
                { text: "Potongan Promo", value: "potongan_promo" },
                { text: "Status Promo", value: "status_promo" },
                { text: "Actions", value: "actions" },
            ],
            promos: [],
            form: {
                kode_promo: null,
                jenis_promo: null,
                keterangan_promo: null,
                potongan_promo: null,
                status_promo: null,
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
        //read data promo
        readData(){
            var url = this.$api + "/promo";
            this.$http.get(url).then((response) => {
                this.promos = response.data.data;
            });
        },
        //simpan data promo
        save(){
            this.load = true;
            var statusPromo = null;
            if(this.form.status_promo == "Aktif")
                statusPromo = 1;
            else
                statusPromo = 0;
            this.$http
                .post(this.$api + "/promo", {
                    kode_promo: this.form.kode_promo,
                    jenis_promo: this.form.jenis_promo,
                    keterangan_promo: this.form.keterangan_promo,
                    potongan_promo: this.form.potongan_promo,
                    status_promo: statusPromo,
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
        //mengubah data promo
        update(){
            var statusPromo = null;
            if(this.form.status_promo == "Aktif")
                statusPromo = 1;
            else
                statusPromo = 0;
            let newData = {
                kode_promo: this.form.kode_promo,
                jenis_promo: this.form.jenis_promo,
                keterangan_promo: this.form.keterangan_promo,
                potongan_promo: this.form.potongan_promo,
                status_promo: statusPromo,
            };
            var url = this.$api + "/promo/" + this.editId;
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
        //menghapus data promo
        deleteData(){
            //hapus data
            var url = this.$api + "/promo/" + this.deleteId;
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
            this.editId = item.id_promo;
            this.form.jabatan = item.jabatan;
            this.form.kode_promo = item.kode_promo;
            this.form.jenis_promo = item.jenis_promo;
            this.form.keterangan_promo = item.keterangan_promo;
            this.form.potongan_promo = item.potongan_promo;
            if(item.status_promo == 1)
                this.form.status_promo = "Aktif";
            else
                this.form.status_promo = "Tidak Aktif";
            this.dialog = true;
        },
        deleteHandler(id){
            this.deleteId = id;
            this.dialogConfirm = true;
        },
        close(){
            this.dialog = false;
            this.inputType = "Ubah";
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
                kode_promo: null,
                jenis_promo: null,
                keterangan_promo: null,
                potongan_promo: null,
                status_promo: null,
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