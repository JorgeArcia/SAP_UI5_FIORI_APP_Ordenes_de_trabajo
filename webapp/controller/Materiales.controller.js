sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "academia2022/luuc3ordenes/model/formatter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, formatter, Fragment, JSONModel, Filter, FilterOperator) {
        "use strict";
        //#region variables globales
        var vIdOrdenTrabajoGlobal = "";
        var vFechaGlobal = "";
        var vLugarFragmentEmpleados = "";
        var vLugarFragmentCategoria = "";
        //#endregion

        return Controller.extend("academia2022.luuc3ordenes.controller.Materiales", {
            formatter: formatter,

             //#region metodos ciclo de vida
            onInit: function () {
                this.getOwnerComponent().getRouter("object").getRoute("materiales").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {
                var vidOrdenTrabajo = oEvent.getParameter("arguments").IdOrdenTrabajo;
                var vFecha = oEvent.getParameter("arguments").Fecha;
                this._obtenerDatosOrden(vidOrdenTrabajo, vFecha);
                this._obtenerMateriales(vidOrdenTrabajo, vFecha);
                this._obtenerEmpleados();
                this._obtenerCategorias();
                vIdOrdenTrabajoGlobal = vidOrdenTrabajo;
                vFechaGlobal = vFecha;
            },

            _obtenerDatosOrden: function (IdOrdenTrabajo, Fecha) {
                var oModel = this.getView().getModel();
                var sPath = "/OrdenesSet(IdOrdenTrabajo='" + IdOrdenTrabajo.toString() + "',Fecha='" + Fecha.toString() + "')";

                oModel.read(sPath, {
                    success: function (oData) {
                        var oModelLocalJson = new sap.ui.model.json.JSONModel();
                        oModelLocalJson.setData(oData);
                        this.getView().setModel(oModelLocalJson, "ModeloLocalOrdenes");
                    }.bind(this),

                    error: function () {
                        sap.m.MessageToast.show("Error al conectar con SAP");
                    }.bind(this)
                });
            },

            _obtenerMateriales: function (IdOrdenTrabajo, Fecha) {
                var oModel = this.getView().getModel();
                var sPath = "/OrdenesSet(IdOrdenTrabajo='" + IdOrdenTrabajo.toString() + "',Fecha='" + Fecha.toString() + "')/MaterialesSet";

                oModel.read(sPath, {
                    success: function (oData) {
                        var oModelLocalJson = new sap.ui.model.json.JSONModel();
                        oModelLocalJson.setData(oData.results);
                        this.getView().byId("idMateriales").setModel(oModelLocalJson, "ModeloLocalMateriales");
                    }.bind(this),

                    error: function () {
                        sap.m.MessageToast.show("Error al conectar con SAP");
                    }.bind(this)
                });
            },
            //#endregion

            //#region ValueHelp's
            _obtenerEmpleados: function(){
                var oModel = this.getView().getModel();

                oModel.read("/EmpleadosSet",{
                    success: function(oData) {
                        var oModelLocalJson = new sap.ui.model.json.JSONModel();
                        oModelLocalJson.setData(oData.results);
                        this.getView().setModel(oModelLocalJson, "MatchEmpleados");
                    }.bind(this),

                    error: function () {
                        sap.m.MessageToast.show("Error al conectar con SAP");
                    }.bind(this)
                });
            },

            onValueHelpEmpleado: function(oEvent) {
                if (!this._valueHelpEmpleado) {
                    this._valueHelpEmpleado = sap.ui.xmlfragment("frgSucursal", "academia2022.luuc3ordenes.view.Empleados", this);
                    this.getView().addDependent(this._valueHelpEmpleado);
                }
                this._valueHelpEmpleado.open();
            },

            _closeValueHelpEmpleados: function (oEvent) {
                var oSelectedItem = oEvent.getParameters().selectedItem;
                var sPath = oSelectedItem.getBindingContext("MatchEmpleados").sPath;
                var oObject = this.getView().getModel("MatchEmpleados").getObject(sPath);
                if (vLugarFragmentEmpleados == "input") {
                    sap.ui.getCore().byId("IdEmpleado").setValue(oObject.IdEmpleado);
                    vLugarFragmentEmpleados = "";
                }else{
                    this.getView().byId("IdEmpleado").setValue(oObject.IdEmpleado);
                    vLugarFragmentEmpleados = "";
                    this.onFiltrarMateriales();
                }
            },
    
            _closeEmpleados: function (oEvent) {
                this._valueHelpEmpleado.close();
            },

            onSearchEmpleados: function (oEvent) {
                var aFilters = [];
                var sQuery = oEvent.getParameter("value");
                if (sQuery && sQuery.length > 0) {
                    var filter = new Filter({
                        filters: [
                            new Filter("idLegajo", sap.ui.model.FilterOperator.Contains, sQuery),
                            new Filter("nombreEmp", sap.ui.model.FilterOperator.Contains, sQuery),
                            new Filter("apellidoEmp", sap.ui.model.FilterOperator.Contains, sQuery),
                        ],
                        and: false
                    });
                    aFilters.push(filter);
                }
                oEvent.getSource().getBinding("items").filter(aFilters);
            },
            
            _obtenerCategorias: function() {
                var oModel = this.getView().getModel();

                oModel.read("/CategoriasSet",{
                    success: function(oData) {
                        var oModelLocalJson = new sap.ui.model.json.JSONModel();
                        oModelLocalJson.setData(oData.results);
                        this.getView().setModel(oModelLocalJson, "MatchCategorias");
                    }.bind(this),

                    error: function () {
                        sap.m.MessageToast.show("Error al conectar con SAP");
                    }.bind(this)
                });
            },

            onValueHelpCategoria: function(oEvent) {
                if (!this._valueHelpCategorias) {
                    this._valueHelpCategorias = sap.ui.xmlfragment("frgSucursal", "academia2022.luuc3ordenes.view.Categorias", this);
                    this.getView().addDependent(this._valueHelpCategorias);
                }
                this._valueHelpCategorias.open();
            },

            _closeValueHelpCategorias: function (oEvent) {
                var oSelectedItem = oEvent.getParameters().selectedItem;
                var sPath = oSelectedItem.getBindingContext("MatchCategorias").sPath;
                var oObject = this.getView().getModel("MatchCategorias").getObject(sPath);
                if (vLugarFragmentCategoria == "input") {
                    sap.ui.getCore().byId("idCategoria").setValue(oObject.CategoriaMaterial);
                    vLugarFragmentCategoria = "";
                }else{
                    this.getView().byId("idCategoria").setValue(oObject.CategoriaMaterial);
                    vLugarFragmentCategoria = "";
                    this.onFiltrarMateriales();
                }
            },
    
            _closeCategorias: function (oEvent) {
                this._valueHelpCategorias.close();
            },

            onSearchCategorias: function (oEvent) {
                var aFilters = [];
                var sQuery = oEvent.getParameter("value");
                if (sQuery && sQuery.length > 0) {
                    var filter = new Filter({
                        filters: [
                            new Filter("idCategoria", sap.ui.model.FilterOperator.Contains, sQuery),
                            new Filter("DescCategoria", sap.ui.model.FilterOperator.Contains, sQuery),
                        ],
                        and: false
                    });
                    aFilters.push(filter);
                }
                oEvent.getSource().getBinding("items").filter(aFilters);
            },
            //#endregion

            //#region Filtro de materiales
            onFiltrarMateriales: function(){
                var oModel = this.getView().getModel();
                var aFilter = [];
                var vEmpleado = "";
                var vServicio = "";
                var vCategoria = "";
                
                if (this.getView().byId("IdEmpleado").getValue()) {
                    vEmpleado = this.getView().byId("IdEmpleado").getValue();
                    aFilter.push(new sap.ui.model.Filter("IdEmpleado", 'EQ', vEmpleado))
                }

                if (this.getView().byId("idServicio").getSelectedKey()) {
                    vServicio = this.getView().byId("idServicio").getSelectedKey();
                    aFilter.push(new sap.ui.model.Filter("Servicio", 'EQ', vServicio))
                }

                if (this.getView().byId("idCategoria").getValue()) {
                    vCategoria = this.getView().byId("idCategoria").getValue();
                    aFilter.push(new sap.ui.model.Filter("CategoriaMaterial", 'EQ', vCategoria))
                }

                this.getView().byId("idMateriales").setBusy(true);
                var sPath = "/OrdenesSet(IdOrdenTrabajo='" + vIdOrdenTrabajoGlobal.toString() + "',Fecha='" + vFechaGlobal.toString() + "')/MaterialesSet";

                oModel.read(sPath, {
                    filters: aFilter,
                    success: function(oData) {
                        if (oData.results) {
                            var oModelLocalJson = new sap.ui.model.json.JSONModel();
                            oModelLocalJson.setData(oData.results);
                            this.getView().byId("idMateriales").setModel(oModelLocalJson, "ModeloLocalMateriales");
                        }
                        this.getView().byId("idMateriales").setBusy(false);
                    }.bind(this),

                    error: function () {
                        sap.m.MessageToast.show("Error al conectar con SAP");
                        this.getView().byId("idMateriales").setBusy(true);
                    }.bind(this)
                });
            },

            onResetFiltros: function(oEvent) {
                var orden = this.getView().byId("IdEmpleado").setValue("");
                var orden = this.getView().byId("idCategoria").setValue("");
                var orden = this.getView().byId("idServicio").setSelectedKey("");
                this.onFiltrarMateriales();
            },
            //#endregion

            //#region Borrar materiales
            onBorrarMaterial: function (oEvent) {
                var IdOrdenTrabajo = oEvent.getSource().getBindingContext("ModeloLocalMateriales").getProperty("IdOrdenTrabajo");
                var Fecha = oEvent.getSource().getBindingContext("ModeloLocalMateriales").getProperty("Fecha");
                var IdMaterial = oEvent.getSource().getBindingContext("ModeloLocalMateriales").getProperty("IdMaterial");

                //ventana emergente de confirmacion.
                var opcion = confirm("Quieres eliiminar el material  " + IdMaterial + "?");
                if (opcion == true) {
                    this._onBorrarMaterial(IdOrdenTrabajo, Fecha, IdMaterial);
                } else {
                    console.log("Has clickado Cancelar");
                }
            },

            _onBorrarMaterial(IdOrdenTrabajo, Fecha, IdMaterial) {
                var oModel = this.getView().getModel();
                var sPath = "/MaterialesSet(IdOrdenTrabajo='" + IdOrdenTrabajo.toString() + "',Fecha='" + Fecha.toString() + "',IdMaterial='" + IdMaterial.toString() + "')";

                this.getView().byId("idMateriales").setBusy(true);
                oModel.remove(sPath, {
                    success: function (oData) {
                        this.getView().byId("idMateriales").setBusy(false);
                        sap.m.MessageToast.show("Material borrado con exito!");
                        this._obtenerMateriales(IdOrdenTrabajo, Fecha);
                    }.bind(this),

                    error: function () {
                        sap.m.MessageToast.show("Error al conectar con SAP");
                        this.getView().byId("idOrdenes").setBusy(false);
                    }.bind(this)
                });
            },
            //#endregion

            //#region Agregar materiales
            onAddMaterial: function () {
                vLugarFragmentEmpleados = "input";
                vLugarFragmentCategoria = "input";
                Fragment.load({
                    name: "academia2022.luuc3ordenes.view.AddMateriales",
                    controller: this
                }).then(function (oPopup) {
                    this._oDialogAddMateriales = oPopup;
                    this.getView().addDependent(oPopup);

                    this._oDialogAddMateriales.attachAfterClose(function (oEvent) {
                        oEvent.getSource().destroy();
                    });
                    this._oDialogAddMateriales.open();
                }.bind(this));
            },
            onCloseDialogMateriales: function () {
                this._oDialogAddMateriales.close();
            },
            onSaveMateriales: function () {
                var oModel = this.getView().getModel("ModeloLocalOrdenes").getData();
                var oModelMateriales = this.getView().getModel();
                var objectMaterial = new sap.ui.model.json.JSONModel();

                objectMaterial =
                {
                    IdOrdenTrabajo: oModel.IdOrdenTrabajo,
                    Fecha: oModel.Fecha,
                    IdMaterial: sap.ui.getCore().byId("idmaterial").getValue(),
                    IdEmpleado: sap.ui.getCore().byId("IdEmpleado").getValue(),
                    NombreProducto: sap.ui.getCore().byId("nomProducto").getValue(),
                    Servicio: sap.ui.getCore().byId("idServicio").getSelectedKey(),
                    CategoriaMaterial: sap.ui.getCore().byId("idCategoria").getValue(),
                    Fabricante: sap.ui.getCore().byId("fabricante").getValue(),
                    Cantidad: parseInt(sap.ui.getCore().byId("cantidad").getValue())
                };
                oModelMateriales.create("/MaterialesSet", objectMaterial, {
                    success: function (oData) {
                        sap.m.MessageToast.show("Exito");
                        this._obtenerMateriales(oModel.IdOrdenTrabajo, oModel.Fecha);
                    }.bind(this),
                    error: function () {
                        sap.m.MessageToast.show("Error");
                    }.bind(this),
                });
                this._oDialogAddMateriales.close();
            },
            //#endregion

            //#region Update materiales
            onUpdateMaterial: function (oEvent) {
                vLugarFragmentEmpleados = "input";
                vLugarFragmentCategoria = "input";
                
                var objectUMaterial =
                {
                    IdMaterial: oEvent.getSource().getBindingContext("ModeloLocalMateriales").getProperty("IdMaterial"),
                    IdEmpleado: oEvent.getSource().getBindingContext("ModeloLocalMateriales").getProperty("IdEmpleado"),
                    NombreProducto: oEvent.getSource().getBindingContext("ModeloLocalMateriales").getProperty("NombreProducto"),
                    Servicio: oEvent.getSource().getBindingContext("ModeloLocalMateriales").getProperty("Servicio"),
                    CategoriaMaterial: oEvent.getSource().getBindingContext("ModeloLocalMateriales").getProperty("CategoriaMaterial"),
                    Fabricante: oEvent.getSource().getBindingContext("ModeloLocalMateriales").getProperty("Fabricante"),
                    Cantidad: oEvent.getSource().getBindingContext("ModeloLocalMateriales").getProperty("Cantidad")
                };

                Fragment.load({
                    name: "academia2022.luuc3ordenes.view.UpdateMateriales",
                    controller: this
                }).then(function (oPopup) {
                    this._oDialogUpdateMateriales = oPopup;
                    this.getView().addDependent(oPopup);

                    this._oDialogUpdateMateriales.attachAfterClose(function (oEvent) {
                        oEvent.getSource().destroy();
                    });
                    this._oDialogUpdateMateriales.attachAfterOpen(function () {
                        var oModelEdit = new sap.ui.model.json.JSONModel(objectUMaterial);
                        sap.ui.getCore().byId("IdEmpleado").setValue(objectUMaterial.IdEmpleado);
                        sap.ui.getCore().byId("idServicio").setSelectedKey(objectUMaterial.Servicio);
                        sap.ui.getCore().byId("idCategoria").setValue(objectUMaterial.CategoriaMaterial);
                        this._oDialogUpdateMateriales.setModel(oModelEdit, "EditarMateriales");
                    }.bind(this));
                    this._oDialogUpdateMateriales.open();
                }.bind(this));
            },
            
            onCloseUpdate: function() {
                this._oDialogUpdateMateriales.close();
            },

            onUpdateMateriales: function () {
                var oModelMateriales = this.getView().getModel();
                var objectMaterial = new sap.ui.model.json.JSONModel();

                objectMaterial =
                {
                    IdOrdenTrabajo: vIdOrdenTrabajoGlobal,
                    Fecha: vFechaGlobal,
                    IdMaterial: sap.ui.getCore().byId("idmaterial").getValue(),
                    IdEmpleado: sap.ui.getCore().byId("IdEmpleado").getValue(),
                    NombreProducto: sap.ui.getCore().byId("nomProducto").getValue(),
                    Servicio: sap.ui.getCore().byId("idServicio").getSelectedKey(),
                    CategoriaMaterial: sap.ui.getCore().byId("idCategoria").getValue(),
                    Fabricante: sap.ui.getCore().byId("fabricante").getValue(),
                    Cantidad: parseInt(sap.ui.getCore().byId("cantidad").getValue())
                };

                var sPathUpdate = this.getView().getModel().createKey("/MaterialesSet", { IdOrdenTrabajo : objectMaterial.IdOrdenTrabajo, Fecha : objectMaterial.Fecha, IdMaterial : objectMaterial.IdMaterial });

                oModelMateriales.update(sPathUpdate, objectMaterial, {
                    success: function (oData) {
                        sap.m.MessageToast.show("Exito");
                        this._obtenerMateriales(vIdOrdenTrabajoGlobal, vFechaGlobal);
                    }.bind(this),
                    error: function () {
                        sap.m.MessageToast.show("Error");
                    }.bind(this),
                });
                this._oDialogUpdateMateriales.close();
            }
            //#endregion
        });
    });