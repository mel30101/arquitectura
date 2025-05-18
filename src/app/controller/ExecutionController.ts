import { SharedDirectionsService } from '../services/shared-directions.service';
import { SharedValuesService } from '../services/shared-values.service';
import { ALU } from './alu';
import { Helper } from './helper';
import { UC } from './uc/uc';

// Controlador encargado de gestionar la ejecución de instrucciones y coordinar las señales entre componentes
export class ExecutionController {
  uc = new UC();
  alu = new ALU(this.sharedValuesService);

  // Elementos DOM que representan los componentes visuales del simulador
  elementoUC = document.getElementById('uc');
  elementoPC = document.getElementById('pc');
  elementoMAR = document.getElementById('mar');
  elementoMBR = document.getElementById('mbr');
  elementoIR = document.getElementById('ir');
  elementoALU = document.getElementById('alu');
  elementoBR = document.getElementById('br');
  elementoMemoInstr = document.getElementById('memoria-instrucciones');
  elementoMemoDatos = document.getElementById('memoria-datos');
  elementoBusDatos = document.getElementById('Bdatos');
  elementoBusDirecciones = document.getElementById('Bdirecciones');
  elementoBusControl = document.getElementById('Bcontrol');

  // Variables que almacenan valores intermedios de los registros y memoria
  valorMAR = '';
  valorMBR = '';
  valorIR = '';
  valorPC = '';
  res = '';

  constructor(
    private sharedDirectionsService: SharedDirectionsService,
    private sharedValuesService: SharedValuesService
  ) {
    // Suscripción a cambios en valores compartidos entre componentes
    this.sharedValuesService
      .getValorMAR()
      .subscribe((value) => (this.valorMAR = value));
    this.sharedValuesService
      .getValorMBR()
      .subscribe((value) => (this.valorMBR = value));
    this.sharedValuesService
      .getValorIR()
      .subscribe((value) => (this.valorIR = value));
    this.sharedValuesService
      .getValorPC()
      .subscribe((value) => (this.valorPC = value));
    this.sharedValuesService
      .getValorRes()
      .subscribe((value) => (this.res = value));

    // Inicialización del valor del contador de programa
    this.sharedValuesService.setValorPC('0');
  }

  // Inicia la ejecución del ciclo de instrucciones
  async ExecutionControllerute() {
    console.log('Ejecutando');
    await this.fetchI();
    await this.decoInst();
  }

 
  // Inicia la ejecución de la instrucción de lectura de la memoria de instrucciones
  private async fetchI() {
    let color = '#ffd100';
    this.sharedValuesService.setValorPC(this.valorPC);
    console.log(this.elementoBusDatos)

    // señales para transferir valores entre registros y memoria
    await this.uc.empezarSenal(this.elementoUC!, color);
    await this.leerEscribirPCMAR(); //mueve el valor del PC al MAR
    await this.leerUCMemoriaInstr(); //lee la memoria de instrucciones
    await this.leerMARMemoriaInstrucciones(); //lee el valor del MAR a la memoria de instrucciones
    await this.escribirMemoInstrMBR(); //escribe el valor de la memoria de instrucciones al MBR
    await this.modificarIR(); //mueve el valor del MBR al IR
  }

  // tranferencia de pc a mar
  async leerEscribirPCMAR() {
    let color = 'red';
    await this.uc.empezarSenal(this.elementoPC!, color).then(async () => {
      this.sharedValuesService.setValorMAR(this.valorPC);
      this.uc.empezarSenal(this.elementoPC!, color);
      this.uc.empezarSenal(this.elementoMAR!, color);
      await this.uc.sleep(2000);
    });
  }

  // señales para leer la memoria de instrucciones
  async leerUCMemoriaInstr() {
    let color = 'blue';
    await this.uc.empezarSenal(this.elementoUC!, color).then(async () => {
      this.uc.empezarSenal(this.elementoUC!, color);
      await this.addBlueBorderBusControl();
      await this.removeBusControl();
      this.uc.empezarSenal(this.elementoMemoInstr!, color);
      await this.uc.sleep(2000);
    });
  }

  // señales para leer el valor del MAR a la memoria de instrucciones
  async leerMARMemoriaInstrucciones() {
    let color = '#00FF26';
    await this.uc.empezarSenal(this.elementoMAR!, color).then(async () => {
      await this.addGreenBorderBusDirecciones();
      await this.removeBusDirecciones();
      this.uc.empezarSenal(this.elementoMAR!, color);
      this.uc.empezarSenal(this.elementoMemoInstr!, color);
      await this.uc.sleep(2000);
    });
  }

  // señales para escribir el valor de la memoria de instrucciones al MBR
  async escribirMemoInstrMBR() {
    let color = '#a2a5a7';
    await this.uc
      .empezarSenal(this.elementoMemoInstr!, color)
      .then(async () => {
        await this.addGrayBorderBusDatos();
        await this.removeBorderBusDatos();
        this.uc.empezarSenal(this.elementoMemoInstr!, color);
        this.uc.empezarSenal(this.elementoMBR!, color);
        this.getValMARMemoInstr();
        this.modificarMBR(this.valorMBR);
        await this.uc.sleep(2000);
      });
  }

  getValMARMemoInstr() {
    let i = parseInt(this.valorMAR);
    this.valorMBR = this.sharedDirectionsService.getInstruccion(i);
  }

  modificarMBR(valorMBR: string) {
    this.sharedValuesService.setValorMBR(valorMBR);
  }

  // señales para mover el valor del MBR al IR
  async modificarIR() {
    let color = 'red';
    await this.uc.empezarSenal(this.elementoMBR!, color).then(async () => {
      this.uc.empezarSenal(this.elementoMBR!, color);
      this.uc.empezarSenal(this.elementoIR!, color);
      this.sharedValuesService.setValorIR(this.valorMBR);
      await this.uc.sleep(2000);
    });
  }

  //////////////////////////////////////////////////////////////7

  // decodifica la instrucción en el IR y la ejecuta
  private async decoInst() {
    await this.moveInstIRUC();
    return await Promise.resolve();
  }

  // tranferencia de ir a uc
  async moveInstIRUC() {
    let color = 'red';
    await this.uc.empezarSenal(this.elementoIR!, color).then(async () => {
      this.uc.empezarSenal(this.elementoIR!, color);
      this.uc.empezarSenal(this.elementoUC!, color);
      this.sharedValuesService.setValorIR(this.valorMBR);
      this.identificarInstUC();
      await this.uc.sleep(2000);
    });
  }

  // decodifica y ejecuta la instrucción usando la UC y la ALU
  async identificarInstUC() {
    let array = Helper.splitString(this.valorIR);
    if (array.length == 0) {
      return;
    }

    let codop = array[0]; //código de operación
    if (codop == 'HALT') {
      return;
    }
    let dirOp1 = array[1]; //dirección del operando 1
    let dirOp2 = array[2]; //dirección del operando 2
    let dirRes = array[3]; //dirección del resultado

    // if ('MOV' != codop) {
    //   await this.moveInstr();
    // }
    await this.calcularDirOp(dirOp1, dirOp2); //calcula las direcciones de los operandos
    await this.moverBRALU(dirOp1, dirOp2); //mueve los operandos a la ALU
    await this.ExecutionControllerUCALU(codop); //ejecuta la operación en la ALU
    await this.moverUCMAR(dirRes); //mueve la dirección del resultado a la MAR
    await this.modificarALU_MBR(); //mueve el resultado de la ALU al MBR
    await this.escribirUCMemoDatos(); //escribe el valor de la UC en la memoria de datos
    await this.escribirMARMemoDatos(); //escribe el valor de la MAR en la memoria de datos
    await this.escribirMBRMemoDatos(dirRes, this.res); //escribe el valor del MBR en la memoria de datos
    await this.calculNextInstr(); //calcula la siguiente instrucción
    if (
      Number(this.valorPC) !=
      this.sharedDirectionsService.getDataInstrccionesLen()
    ) {
      this.ExecutionControllerute();
    }
  }

  // async moveInstr() {}

  // calcula las direcciones de los operandos
  async calcularDirOp(dirOp1: string, dirOp2: string) {
    await this.moverOpBC(dirOp1);
    await this.moverOpBC(dirOp2);
  }

  async moverOpBC(dirOp: string) {
    await this.moverUCMAR(dirOp);
    await this.leerUCMemoriaDatos();
    await this.leerMARMemoriaDatos();
    await this.escribirMemoDatosMBR();
    await this.modificarMBR_BR();
  }

  async moverUCMAR(dirOp: string) {
    let color = 'red';
    await this.uc.empezarSenal(this.elementoUC!, color).then(async () => {
      this.uc.empezarSenal(this.elementoUC!, color);
      this.uc.empezarSenal(this.elementoMAR!, color);
      this.sharedValuesService.setValorMAR(dirOp);
      await this.uc.sleep(2000);
    });
  }

  async leerUCMemoriaDatos() {
    let color = 'blue';
    await this.uc.empezarSenal(this.elementoUC!, color).then(async () => {
      await this.addBlueBorderBusControl();
      await this.removeBusControl();
      this.uc.empezarSenal(this.elementoUC!, color);
      this.uc.empezarSenal(this.elementoMemoDatos!, color);
      await this.uc.sleep(2000);
    });
  }

  async leerMARMemoriaDatos() {
    let color = '#00FF26';
    await this.uc.empezarSenal(this.elementoMAR!, color).then(async () => {
      await this.addGreenBorderBusDirecciones();
      await this.removeBusDirecciones();
      this.uc.empezarSenal(this.elementoMAR!, color);
      this.uc.empezarSenal(this.elementoMemoDatos!, color);
      await this.uc.sleep(2000);
    });
  }

  async escribirMemoDatosMBR() {
    let color = '#a2a5a7';
    await this.uc
      .empezarSenal(this.elementoMemoDatos!, color)
      .then(async () => {
        await this.addGrayBorderBusDatos();
        await this.removeBorderBusDatos();
        this.uc.empezarSenal(this.elementoMemoDatos!, color);
        this.uc.empezarSenal(this.elementoMBR!, color);
        this.getValMARMemoDatos();
        this.modificarMBR(this.valorMBR);
        await this.uc.sleep(2000);
      });
  }

  getValMARMemoDatos() {
    let i = parseInt(this.valorMAR);
    this.valorMBR = this.sharedDirectionsService.getDato(i);
  }

  async modificarMBR_BR() {
    let color = 'red';
    await this.uc.empezarSenal(this.elementoMBR!, color).then(async () => {
      this.uc.empezarSenal(this.elementoMBR!, color);
      this.uc.empezarSenal(this.elementoBR!, color);
      this.sharedDirectionsService.pushDataRegistros(this.valorMBR);
      await this.uc.sleep(2000);
    });
  }

  async moverBRALU(dirOp1: string, dirOp2: string) {
    let color = 'red';
    await this.uc.empezarSenal(this.elementoBR!, color).then(async () => {
      this.uc.empezarSenal(this.elementoBR!, color);
      this.uc.empezarSenal(this.elementoALU!, color);
      let i1 = parseInt(dirOp1);
      let i2 = parseInt(dirOp2);
      let op1 = this.sharedDirectionsService.getDato(i1);
      let op2 = this.sharedDirectionsService.getDato(i2);
      this.sharedValuesService.setValorOP1(op1);
      this.sharedValuesService.setValorOP2(op2);
      await this.uc.sleep(2000);
    });
  }

  async ExecutionControllerUCALU(codop: string) {
    let color = 'red';
    await this.uc.empezarSenal(this.elementoUC!, color).then(async () => {
      this.uc.empezarSenal(this.elementoUC!, color);
      this.uc.empezarSenal(this.elementoALU!, color);
      this.alu.realizarOperacion(codop);
      await this.uc.sleep(2000);
    });
  }

  async modificarALU_MBR() {
    let color = 'red';
    await this.uc.empezarSenal(this.elementoALU!, color).then(async () => {
      this.uc.empezarSenal(this.elementoALU!, color);
      this.uc.empezarSenal(this.elementoMBR!, color);
      this.modificarMBR(this.res);
      await this.uc.sleep(2000);
    });
  }

  async escribirUCMemoDatos() {
    let color = 'blue';
    await this.uc.empezarSenal(this.elementoUC!, color).then(async () => {
      await this.addBlueBorderBusControl();
      await this.removeBusControl();
      this.uc.empezarSenal(this.elementoUC!, color);
      this.uc.empezarSenal(this.elementoMemoDatos!, color);
      await this.uc.sleep(2000);
    });
  }

  async escribirMARMemoDatos() {
    let color = '#00FF26';
    await this.uc.empezarSenal(this.elementoMAR!, color).then(async () => {
      await this.addGreenBorderBusDirecciones();
      await this.removeBusDirecciones();
      this.uc.empezarSenal(this.elementoMAR!, color);
      this.uc.empezarSenal(this.elementoMemoDatos!, color);
      await this.uc.sleep(2000);
    });
  }

  async escribirMBRMemoDatos(dir1: string, valor: string) {
    let dir = parseInt(dir1);
    let color = '#a2a5a7';
    await this.uc.empezarSenal(this.elementoMBR!, color).then(async () => {
      await this.addGrayBorderBusDatos();
      await this.removeBorderBusDatos();
      this.uc.empezarSenal(this.elementoMBR!, color);
      this.uc.empezarSenal(this.elementoMemoDatos!, color);
      this.sharedDirectionsService.insertarMemoDatos(dir, valor);
      await this.uc.sleep(2000);
    });
  }
  //////////////////////////////////////////////////////

  async calculNextInstr() {
    await this.moverPCALU();
    await this.moverALUBR();
    await this.moverBRPC();
  }

  async moverPCALU() {
    let color = 'red';
    await this.uc.empezarSenal(this.elementoPC!, color).then(async () => {
      this.uc.empezarSenal(this.elementoPC!, color);
      this.uc.empezarSenal(this.elementoALU!, color);
      this.sharedValuesService.setValorOP1(this.valorPC);
      this.sharedValuesService.setValorOP2('1');
      this.alu.realizarOperacion('ADD');
      await this.uc.sleep(2000);
    });
  }

  async moverALUBR() {
    let color = 'red';
    await this.uc.empezarSenal(this.elementoALU!, color).then(async () => {
      this.uc.empezarSenal(this.elementoALU!, color);
      this.uc.empezarSenal(this.elementoBR!, color);
      this.sharedDirectionsService.pushDataRegistros(this.res);
      await this.uc.sleep(2000);
    });
  }

  async moverBRPC() {
    let color = 'red';
    await this.uc.empezarSenal(this.elementoBR!, color).then(async () => {
      this.uc.empezarSenal(this.elementoBR!, color);
      this.uc.empezarSenal(this.elementoPC!, color);
      this.sharedValuesService.setValorPC(this.res);
      await this.uc.sleep(2000);
    });
  }

  async addGrayBorderBusDatos(): Promise<void> {
    return new Promise(async (resolve) => {
      this.elementoBusDatos!.style.border = '5px solid gray';
      await this.uc.sleep(2000);
      resolve(); // Resuelve la promesa inmediatamente
    });
  }
  
  async removeBorderBusDatos(): Promise<void> {
    return new Promise(async (resolve) => {
      this.elementoBusDatos!.style.border = '';
      resolve();
    });
  }
  
  async addBlueBorderBusControl(): Promise<void> {
    return new Promise(async (resolve) => {
      this.elementoBusControl!.style.border = '5px solid blue';
      await this.uc.sleep(2000);
      resolve();
    });
  }
  
  async removeBusControl(): Promise<void> {
    return new Promise(async (resolve) => {
      this.elementoBusControl!.style.border = '';
      resolve();
    });
  }
  
  async addGreenBorderBusDirecciones(): Promise<void> {
    return new Promise(async (resolve) => {
      this.elementoBusDirecciones!.style.border = '5px solid #00FF26';
      await this.uc.sleep(2000);
      resolve();
    });
  }
  
  async removeBusDirecciones(): Promise<void> {
    return new Promise(async (resolve) => {
      this.elementoBusDirecciones!.style.border = '';
      resolve();
    });
  }
  
}
