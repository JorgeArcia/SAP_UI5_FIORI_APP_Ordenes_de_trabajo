sap.ui.define([], function() {
    'use strict';
    
    return {
        formatearPrioridad: function(Prioridad) {
            var salida = "";
            switch(Prioridad) {
                case "4":
                    salida = "Success";
                    break;
                case "3":
                    salida = "Information";
                    break;
                case "2":
                    salida = "Warning";
                    break;    
                case "1":
                    salida = "Error";
                    break;
                default:
                    salida = "Success";
            }
            return salida;
        },
        formaterarStatus: function(Status){
            var salida = "";
            switch(Status) {
                case "3":
                    salida = "Success";
                    break;
                case "2":
                    salida = "Warning";
                    break;    
                case "1":
                    salida = "Information";
                    break;
                default:
                    salida = "Success";    
            }
            return salida;
        }
    };
});