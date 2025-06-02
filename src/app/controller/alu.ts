import { PcComponent } from '../components/pc/pc.component';
import { SharedValuesService } from '../services/shared-values.service';

export class ALU {
  op1 = '';
  op2 = '';
  res = '';

  constructor(private sharedValuesService: SharedValuesService) {
    this.sharedValuesService
      .getValorOP1()
      .subscribe((value) => (this.op1 = value));
    this.sharedValuesService
      .getValorOP2()
      .subscribe((value) => (this.op2 = value));
    this.sharedValuesService
      .getValorRes()
      .subscribe((value) => (this.res = value));
  }

  async realizarOperacion(codop: string) {
    let res = 0;

    switch (codop) {
      case 'ADD': // Suma
        res = Number(this.op1) + Number(this.op2);
        break;

      case 'SUB': // Resta
        res = Number(this.op1) - Number(this.op2);
        break;

      case 'MUL': // Multiplicación
        res = Number(this.op1) * Number(this.op2);
        break;

      case 'DIV': // División
        if (Number(this.op2) === 0) {
          console.error('Error: División por cero.');
          return;
        }
        res = Number(this.op1) / Number(this.op2);
        break;

      case 'MOD': // Módulo
        res = Number(this.op1) % Number(this.op2);
        break;

      case 'CMP': // Comparación de igualdad
        res = Number(this.op1 == this.op2);
        break;

      case 'AND': // AND lógico
        res = Number(this.op1 && this.op2);
        break;

      case 'OR': // OR lógico
        res = Number(this.op1 || this.op2);
        break;

      case 'NCMP': // Comparación de desigualdad
        res = Number(this.op1 != this.op2);
        break;

      case 'XOR': // XOR lógico
        res = Number(!!this.op1 !== !!this.op2); // Convertir a booleanos
        break;

      case 'SHL': // Desplazamiento a la izquierda
        res = Number(this.op1) << Number(this.op2);
        break;

      case 'SHR': // Desplazamiento a la derecha
        res = Number(this.op1) >> Number(this.op2);
        break;
      
      case 'DEC': // Decrementar
        res = Number(this.op1) - 1;
        break;

      default: // Manejo de operación no reconocida
        console.error('Operación no reconocida:', codop);
        return;
    }

    this.res = res.toString();
    this.sharedValuesService.setValorRes(this.res);
  }
}
