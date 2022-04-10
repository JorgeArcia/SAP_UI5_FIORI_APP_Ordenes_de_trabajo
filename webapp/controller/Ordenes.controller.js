sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "academia2022/luuc3ordenes/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, formatter, Filter, FilterOperator, Fragment, JSONModel, History) {
        "use strict";
        var vLugarFragmentSucursal = "";
        var oController;

        return Controller.extend("academia2022.luuc3ordenes.controller.Ordenes", {
            formatter: formatter,

            //#region metodos ciclo de vida
            onInit: function () {
                oController = this;
                this.getOwnerComponent().getRouter("object").getRoute("RouteOrdenes").attachPatternMatched(this._onObjectMatched, this);
                // this._obtenerOrdenes();
                // this._obtenerSucursales();
            },

            _onObjectMatched: function(oEvent) {
                this._obtenerOrdenes();
                this._obtenerSucursales();
            },

            _obtenerOrdenes: function(){
                var oModel = this.getView().getModel();

                oModel.read("/OrdenesSet",{
                    success: function(oData) {
                        var oModelLocalJson = new sap.ui.model.json.JSONModel();
                        oModelLocalJson.setData(oData.results);
                        this.getView().byId("idOrdenes").setModel(oModelLocalJson,"ModeloLocalOrdenes");
                    }.bind(this),

                    error: function () {
                        sap.m.MessageToast.show("Error al conectar con SAP");
                    }.bind(this)
                });
            },

            OnVisualizarMateriales: function(oEvent){
                this.getOwnerComponent().getRouter().navTo("materiales", {
                    IdOrdenTrabajo: oEvent.getSource().getBindingContext("ModeloLocalOrdenes").getProperty("IdOrdenTrabajo"),
                    Fecha: oEvent.getSource().getBindingContext("ModeloLocalOrdenes").getProperty("Fecha")
                });

            },
            //#endregion

            //#region Filtro de ordenes
            onFiltrarOrdenes: function(){
                var oModel = this.getView().getModel();
                var aFilter = [];
                var vStatus = "";
                var vIdOrdenTrabajo = "";
                var vSucursal = "";
                
                if (this.getView().byId("idOrden").getValue()) {
                    vIdOrdenTrabajo = this.getView().byId("idOrden").getValue();
                    aFilter.push(new sap.ui.model.Filter("IdOrdenTrabajo", sap.ui.model.FilterOperator.Contains, vIdOrdenTrabajo))
                }

                if (this.getView().byId("idStatus").getSelectedKey()) {
                    vStatus = this.getView().byId("idStatus").getSelectedKey();
                    aFilter.push(new sap.ui.model.Filter("Status", 'EQ', vStatus))
                }

                if (this.getView().byId("idSucursal").getValue()) {
                    vSucursal = this.getView().byId("idSucursal").getValue();
                    aFilter.push(new sap.ui.model.Filter("Ubicacion", 'EQ', vSucursal))
                }

                this.getView().byId("idOrdenes").setBusy(true);

                oModel.read("/OrdenesSet",{
                    filters: aFilter,
                    success: function(oData) {
                        if (oData.results) {
                            var oModelLocalJson = new sap.ui.model.json.JSONModel();
                            oModelLocalJson.setData(oData.results);
                            this.getView().byId("idOrdenes").setModel(oModelLocalJson, "ModeloLocalOrdenes");
                        }
                        this.getView().byId("idOrdenes").setBusy(false);
                    }.bind(this),

                    error: function () {
                        sap.m.MessageToast.show("Error al conectar con SAP");
                        this.getView().byId("idOrdenes").setBusy(true);
                    }.bind(this)
                });
            },

            onResetFiltros: function(oEvent) {
                var orden = this.getView().byId("idOrden").setValue("");
                var orden = this.getView().byId("idSucursal").setValue("");
                var orden = this.getView().byId("idStatus").setSelectedKey("");
                this.onFiltrarOrdenes();
            },
            //#endregion

            //#region ValueHelp's
            _obtenerSucursales: function(){
                var oModel = this.getView().getModel();

                oModel.read("/SucursalSet",{
                    success: function(oData) {
                        var oModelLocalJson = new sap.ui.model.json.JSONModel();
                        oModelLocalJson.setData(oData.results);
                        this.getView().setModel(oModelLocalJson, "MatchSucursales");
                    }.bind(this),

                    error: function () {
                        sap.m.MessageToast.show("Error al conectar con SAP");
                    }.bind(this)
                });
            },

            onValueHelpSucursales: function(oEvent) {
                if (!this._valueHelpSucursal) {
                    this._valueHelpSucursal = sap.ui.xmlfragment("frgSucursal", "academia2022.luuc3ordenes.view.Sucursales", this);
                    this.getView().addDependent(this._valueHelpSucursal);
                }
                this._valueHelpSucursal.open();
            },

            _closeValueHelpSucursal: function (oEvent) {
                var oSelectedItem = oEvent.getParameters().selectedItem;
                var sPath = oSelectedItem.getBindingContext("MatchSucursales").sPath;
                var oObject = this.getView().getModel("MatchSucursales").getObject(sPath);
                if (vLugarFragmentSucursal == "input") {
                    sap.ui.getCore().byId("idSucursal").setValue(oObject.CodSucursal);
                    vLugarFragmentSucursal = "";
                }else{
                    this.getView().byId("idSucursal").setValue(oObject.CodSucursal);
                    vLugarFragmentSucursal = "";
                    this.onFiltrarOrdenes();
                }
            },
    
            _closeSucursal: function (oEvent) {
                this._valueHelpSucursal.close();
            },

            onSearchSucursal: function (oEvent) {
                var aFilters = [];
                var sQuery = oEvent.getParameter("value");
                if (sQuery && sQuery.length > 0) {
                    var filter = new Filter({
                        filters: [
                            new Filter("CodSucursal", sap.ui.model.FilterOperator.Contains, sQuery),
                            new Filter("DescSucursal", sap.ui.model.FilterOperator.Contains, sQuery),
                        ],
                        and: false
                    });
                    aFilters.push(filter);
                }
                oEvent.getSource().getBinding("items").filter(aFilters);
            }, 
            //#endregion

            //#region Borrar ordenes
            onBorrarOrden: function(oEvent) {
                var IdOrdenTrabajo = oEvent.getSource().getBindingContext("ModeloLocalOrdenes").getProperty("IdOrdenTrabajo");
                var Fecha = oEvent.getSource().getBindingContext("ModeloLocalOrdenes").getProperty("Fecha");

                //ventana emergente de confirmacion.
                var opcion = confirm("Quieres eliminar la Orden de trabajo N° " + IdOrdenTrabajo);
                if (opcion == true) {
                    this._onBorrarOrden(IdOrdenTrabajo,Fecha)
                } else {
                    console.log("Has clickado Cancelar");
                }
            },
            
            _onBorrarOrden(IdOrdenTrabajo,Fecha) {
                var oModel = this.getView().getModel();
                var sPath = "/OrdenesSet(IdOrdenTrabajo='" + IdOrdenTrabajo.toString() + "',Fecha='" + Fecha.toString() + "')";

                this.getView().byId("idOrdenes").setBusy(true);
                oModel.remove(sPath, {
                    success: function(oData) {
                        this.getView().byId("idOrdenes").setBusy(false);
                        sap.m.MessageToast.show("Orden borrada con exito!");
                        this._obtenerOrdenes();
                    }.bind(this),

                    error: function () {
                        sap.m.MessageToast.show("Error al conectar con SAP");
                        this.getView().byId("idOrdenes").setBusy(false);
                    }.bind(this)
                });
            },
            //#endregion

            //#region  Agregar Ordenes
            onAddOrdenTrabajo: function() {
                vLugarFragmentSucursal = "input";
                Fragment.load({
                    name: "academia2022.luuc3ordenes.view.AddOrdenes",
                    controller: this
                }).then(function (oPopup) {
                    this._oDialogAddOrdenes = oPopup;
                    this.getView().addDependent(oPopup);

                    this._oDialogAddOrdenes.attachAfterClose(function (oEvent) {
                        oEvent.getSource().destroy();
                    });
                    this._oDialogAddOrdenes.open();
                }.bind(this));
            },

            onCloseDialogOrdenes: function() {
                this._oDialogAddOrdenes.close();
            },

            onSaveOrdenes: function() {
                var oModelOrdenes = this.getView().getModel();
                var objectOrdenes = new JSONModel();

                var fechaOld = sap.ui.getCore().byId("idFecha").getValue()
                var nueva = fechaOld.split(" ")[0];
                console.log(nueva)
                var format = nueva.split("-")
                console.log(format)
                var ultima = format[0] + '.' + format[1] + '.' + format[2]
                console.log(ultima)

                var fechaConver = new Date(ultima);
                fechaConver = `${fechaConver.getDate() < 10 ? `0${fechaConver.getDate()}` : fechaConver.getDate()}.${fechaConver.getMonth() + 1 < 10 ? `0${fechaConver.getMonth() + 1}` : fechaConver.getMonth() + 1}.${fechaConver.getFullYear()}`;

                objectOrdenes =
                {
                    IdOrdenTrabajo: sap.ui.getCore().byId("idOrden").getValue(),
                    Fecha: fechaConver,
                    Generada_por: sap.ui.getCore().byId("idCliente").getValue(),
                    Descripcion: sap.ui.getCore().byId("descripcion").getValue(),
                    Prioridad: sap.ui.getCore().byId("idPrioridad").getSelectedKey(),
                    Ubicacion: sap.ui.getCore().byId("idSucursal").getValue(),
                    Posicion: sap.ui.getCore().byId("posicion").getValue(),
                    Status: sap.ui.getCore().byId("idStatus").getSelectedKey()
                };
                oModelOrdenes.create("/OrdenesSet", objectOrdenes, {
                    success: function (oData) {
                        sap.m.MessageToast.show("Exito");
                        this._obtenerOrdenes();
                    }.bind(this),
                    error: function () {
                        sap.m.MessageToast.show("Error");
                    }.bind(this),
                });
                this._oDialogAddOrdenes.close();
            },
            //#endregion

            //#region Update Ordenes
            onUpdateOrden: function(oEvent) {
                vLugarFragmentSucursal = "input";
                var objectUOrden =
                {
                    IdOrdenTrabajo: oEvent.getSource().getBindingContext("ModeloLocalOrdenes").getProperty("IdOrdenTrabajo"),
                    Fecha: oEvent.getSource().getBindingContext("ModeloLocalOrdenes").getProperty("Fecha"),
                    Generada_por: oEvent.getSource().getBindingContext("ModeloLocalOrdenes").getProperty("Generada_por"),
                    Descripcion: oEvent.getSource().getBindingContext("ModeloLocalOrdenes").getProperty("Descripcion"),
                    Prioridad: oEvent.getSource().getBindingContext("ModeloLocalOrdenes").getProperty("Prioridad"),
                    Ubicacion: oEvent.getSource().getBindingContext("ModeloLocalOrdenes").getProperty("Ubicacion"),
                    Posicion: oEvent.getSource().getBindingContext("ModeloLocalOrdenes").getProperty("Posicion"),
                    Status: oEvent.getSource().getBindingContext("ModeloLocalOrdenes").getProperty("Status")
                };

                Fragment.load({
                    name: "academia2022.luuc3ordenes.view.UpdateOrdenes",
                    controller: this
                }).then(function (oPopup) {
                    this._oDialogUpdateOrdenes = oPopup;
                    this.getView().addDependent(oPopup);

                    this._oDialogUpdateOrdenes.attachAfterClose(function (oEvent) {
                        oEvent.getSource().destroy();
                    });
                    this._oDialogUpdateOrdenes.attachAfterOpen(function () {
                        var oModelEdit = new sap.ui.model.json.JSONModel(objectUOrden);
                        sap.ui.getCore().byId("idSucursal").setValue(objectUOrden.Ubicacion);
                        sap.ui.getCore().byId("idPrioridad").setSelectedKey(objectUOrden.Prioridad);
                        sap.ui.getCore().byId("idStatus").setSelectedKey(objectUOrden.Status);
                        this._oDialogUpdateOrdenes.setModel(oModelEdit, "EditarOrdenes");
                    }.bind(this));
                    this._oDialogUpdateOrdenes.open();
                }.bind(this));
            },

            onCloseDialogUpdateOrdenes: function() {
                this._oDialogUpdateOrdenes.close();
            },

            onUpdateOrdenes: function () {
                var oModelOrdenes = this.getView().getModel();
                var objectOrdenes = new sap.ui.model.json.JSONModel();

                objectOrdenes =
                {
                    IdOrdenTrabajo: sap.ui.getCore().byId("idOrden").getValue(),
                    Fecha: sap.ui.getCore().byId("idFecha").getValue(),
                    Generada_por: sap.ui.getCore().byId("idCliente").getValue(),
                    Descripcion: sap.ui.getCore().byId("descripcion").getValue(),
                    Prioridad: sap.ui.getCore().byId("idPrioridad").getSelectedKey(),
                    Ubicacion: sap.ui.getCore().byId("idSucursal").getValue(),
                    Posicion: sap.ui.getCore().byId("posicion").getValue(),
                    Status: sap.ui.getCore().byId("idStatus").getSelectedKey()
                };

                var sPathUpdate = this.getView().getModel().createKey("/OrdenesSet", { IdOrdenTrabajo : objectOrdenes.IdOrdenTrabajo, Fecha : objectOrdenes.Fecha });

                oModelOrdenes.update(sPathUpdate, objectOrdenes, {
                    success: function (oData) {
                        sap.m.MessageToast.show("Exito");
                        this._obtenerOrdenes();
                    }.bind(this),
                    error: function () {
                        sap.m.MessageToast.show("Error");
                    }.bind(this),
                });
                this._oDialogUpdateOrdenes.close();
            },
            //#endregion

            //Navegar hacia atras
            onNavBack: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                this.getView().unbindElement();
                var oHistory = History.getInstance(), // Reviso el historial 
                    sPreviousHash = oHistory.getPreviousHash(); // Pregunto que valor tiene
                if (sPreviousHash == undefined) { // Si no tiene valor vuelvo 1 vista hacia atrás
                    window.history.go(-1);
                } else {    // Caso contrario regreso a la vista de Aviones
                    var bReplace = true;
                    oRouter.navTo("RouteStartApp", {}, bReplace);
                }
            }
        });
    });
