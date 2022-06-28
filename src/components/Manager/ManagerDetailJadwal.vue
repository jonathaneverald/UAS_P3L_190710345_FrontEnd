<template>
    <v-main class="detailjadwal">
        <h3 class="text-h3 font-weight-medium mb-5">Detail Jadwal Pegawai</h3>
        <v-card>
            <v-card-title>
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
                <v-spacer></v-spacer>
            </v-card-title>

            <v-data-table :headers="headers" :items="detailjadwals" :search="search">
                <template v-slot:[`item.jadwal.hari`]="{ item }">
                    <div v-for="(value, i) in item.jadwal" :key="value ['hari'] + i">
                        {{  value["hari"] }}
                    </div>
                </template>
                <template v-slot:[`item.jadwal.shift`]="{ item }">
                    <div v-for="(value, i) in item.jadwal" :key="value ['shift'] + i">
                        {{  value["shift"] }}
                    </div>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn color="success" class="mr-2" @click="tambahHandler(item)"><v-icon left>mdi-plus</v-icon>Tambah</v-btn>
                    <v-btn color="success" class="mr-2" @click="editHandler(item)"><v-icon left>mdi-pencil</v-icon>Edit</v-btn>
                    <v-btn color="error" @click="deleteHandler(item)"><v-icon left>mdi-delete </v-icon>Delete</v-btn>
                </template>
            </v-data-table>
        </v-card>

        <v-dialog v-model="dialog" persistent width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ formTitle }} Detail Jadwal Pegawai</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-text-field v-model="form.nama_pegawai" label="Nama Pegawai" readonly></v-text-field>
                        <v-select v-model="form.jadwal" :items="jadwal" label="Jadwal Pegawai" required></v-select>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="cancel">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="setForm">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogUpdate" persistent width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Ubah Detail Jadwal Pegawai</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-text-field v-model="formUpdate.nama_pegawai" label="Nama Pegawai" readonly></v-text-field>
                        <v-select v-model="formUpdate.jadwalLama" :items="jadwalLama" label="Jadwal Lama" required></v-select>
                        <v-select v-model="formUpdate.jadwalBaru" :items="jadwalBaru" label="Jadwal Baru" required></v-select>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="cancel">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="update">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogConfirm" persistent max-width="400px">
            <v-card>
                <v-card-title>
                    <span class="headline">Warning!</span>
                </v-card-title>
                <v-card-text>Anda yakin ingin menghapus Jadwal ini?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="dialogConfirm = false">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="deleteData">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="snackbar" :color="color" timeout="2000" bottom>{{ error_message }}</v-snackbar>
        
    </v-main>
</template>

<script> 
export default{
    name: "ManagerDetailJadwal",
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
            dialogUpdate: false,
            headers:[
                { text: "Nama Pegawai", align: "start", sortable: true, value: "nama_pegawai" },
                { text: "Hari", value: "jadwal.hari" },
                { text: "Shift", value: "jadwal.shift" },
                { text: "Actions", value: "actions" },
            ],
            detailjadwals: [],
            jadwal: [],
            jadwalLama: [],
            jadwalBaru: [],
            form: {
                nama_pegawai: null,
                jadwal: null,
            },
            form_jadwal: {
                id_jadwal : null,
                hari: null,
                shift: null,
            },
            formUpdate: {
                nama_pegawai: null,
                jadwalLama: null,
                jadwalBaru: null,
            },
            show: false,
            deleteId: "",
            editId: "",
            menu: false,
        };
    },
    methods: {
        setForm(){
            if(this.inputType !== "Tambah"){
                this.dialogConfirm = true;
            }else{
                this.save();
            }
        },
        //read data jadwal
        readData(){
            var url = this.$api + "/detail_jadwal_pegawai";
            this.$http.get(url).then((response) => {
                this.detailjadwals = response.data.detail;
            });
        },
        //simpan data jadwal
        save(){
            this.load = true;
            var id_jadwal = null;
            var select = null;
            if(this.form.jadwal !=null){
                select = this.form.jadwal;
                for(let i = 0; i<this.form_jadwal.hari.length; i++){
                    if(select.includes(this.form_jadwal.hari[i]) && select.includes(this.form_jadwal.shift[i])){
                        id_jadwal = this.form_jadwal.id_jadwal[i];
                        break;
                    }
                }
            }
            this.$http
                .post(this.$api + "/detail_jadwal_pegawai/" + this.editId, {
                    id_jadwal: id_jadwal,
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
        //mengubah data jadwal
        update(){
            var id_jadwalLama = null,
                id_jadwalBaru = null;
            var select = null;
            if(this.formUpdate.jadwalLama != null){
                select = this.formUpdate.jadwalLama;
                for(let i = 0; i<this.form_jadwal.hari.length; i++){
                    if(select.includes(this.form_jadwal.hari[i]) && select.includes(this.form_jadwal.shift[i])){
                        id_jadwalLama = this.form_jadwal.id_jadwal[i];
                        break;
                    }
                }
            }
            if(this.formUpdate.jadwalBaru != null){
                select = this.formUpdate.jadwalBaru;
                for(let i = 0; i<this.form_jadwal.hari.length; i++){
                    if(select.includes(this.form_jadwal.hari[i]) && select.includes(this.form_jadwal.shift[i])){
                        id_jadwalBaru = this.form_jadwal.id_jadwal[i];
                        break;
                    }
                }
            }
            let newData = {
                id_jadwalLama: id_jadwalLama,
                id_jadwalBaru: id_jadwalBaru,
            }
            var url = this.$api + "/detail_jadwal_pegawai/" + this.editId;
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
                })
                .catch((error) => {
                    this.error_message = error.response.data.message;
                    this.color = "red";
                    this.snackbar = true;
                    this.load = false;
                });
        },
        //menghapus data jadwal
        deleteData(){
            //hapus data
            this.load = true;
            var id_jadwal = null;
            var select = null;
            if(this.form.jadwal !=null){
                select = this.form.jadwal;
                for(let i = 0; i<this.form_jadwal.hari.length; i++){
                    if(select.includes(this.form_jadwal.hari[i]) && select.includes(this.form_jadwal.shift[i])){
                        id_jadwal = this.form_jadwal.id_jadwal[i];
                        break;
                    }
                }
            }
            var url = this.$api + "/detail_jadwal_pegawai/" + this.deleteId + "/" + id_jadwal;
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
            this.editId = item.id_pegawai;
            this.formUpdate.nama_pegawai = item.nama_pegawai;
            this.formUpdate.jadwalLama = item.jadwal.hari + "-" + item.jadwal.shift;
            this.jadwalLama = [];
            for(var jadwal of item.jadwal){
                this.jadwalLama.push(jadwal["hari"] + "-" + jadwal["shift"]);
            }
            this.dialogUpdate = true;
        },
        tambahHandler(item){
            this.form.nama_pegawai = item.nama_pegawai;
            this.editId = item.id_pegawai;
            this.dialog = true;
        },
        deleteHandler(item){
            this.inputType = "Delete";
            this.form.nama_pegawai = item.nama_pegawai;
            this.deleteId = item.id_pegawai;
            this.form.jadwal = item.jadwal.hari + "-" + item.jadwal.shift;
            this.jadwal = [];
            for(var jadwal of item.jadwal){
                this.jadwal.push(jadwal["hari"] + "-" + jadwal["shift"]);
            }
            this.dialog = true;
        },
        close(){
            this.dialog = false;
            this.inputType = "Tambah";
            this.dialogConfirm = false;
            this.dialogUpdate = false;
            this.readData();
        },
        cancel(){
            this.resetForm();
            this.readData();
            this.dialog = false;
            this.dialogConfirm = false;
            this.dialogUpdate = false;
            this.inputType = "Tambah";
        },
        resetForm(){
            this.read_jadwal_id();
            this.form = {
                nama_pegawai: null,
                jadwal: null,
            };
            this.formUpdate = {
                nama_pegawai : null,
                jadwalLama : null,
                jadwalBaru : null,
            };
        },
        read_jadwal_id(){
            var url = this.$api + "/jadwal_pegawai";
            this.$http.get(url).then((response) => {
                let temp = response.data.data;
                this.form_jadwal.id_jadwal = temp.map((v) => v.id_jadwal);
                this.form_jadwal.hari = temp.map((v) => v.hari);
                this.form_jadwal.shift = temp.map((v) => v.shift);
                for(let i = 0; i< this.form_jadwal.hari[i].length; i++){
                    this.jadwal.push(this.form_jadwal.hari[i] + "-" + this.form_jadwal.shift[i]);
                    this.jadwalBaru.push(this.form_jadwal.hari[i] + "-" + this.form_jadwal.shift[i]);
                }
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
        this.read_jadwal_id();
    },
};
</script>