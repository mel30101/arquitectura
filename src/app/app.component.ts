import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { AluComponent } from "./components/alu/alu.component";
import { UcComponent } from "./components/uc/uc.component";
import { PcComponent } from "./components/pc/pc.component";
import { IrComponent } from "./components/ir/ir.component";
import { MarComponent } from "./components/mar/mar.component";
import { MbrComponent } from "./components/mbr/mbr.component";
import { BancoRegistrosComponent } from "./components/banco-registros/banco-registros.component";
import { MemoriaComponent } from "./components/memoria/memoria.component";
import { BusComponent } from "./components/buses/bus.component";
import { FlechasComponent } from "./subcomponents/flechas/flechas.component";
import { OpcionesComponent } from "./subcomponents/opciones/opciones.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AluComponent,
    UcComponent,
    PcComponent,
    IrComponent,
    MarComponent,
    MbrComponent,
    BancoRegistrosComponent,
    MemoriaComponent,
    BusComponent,
    FlechasComponent,
    OpcionesComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'arquiProyect';
}
