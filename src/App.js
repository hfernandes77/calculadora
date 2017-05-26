import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Calculadora</h2>
        </div>
        <p className="App-intro">
          <Calculadora/>
        </p>
      </div>
    );
  }
}

class Botao extends React.Component {
	
	render() {
		return (<div className={this.props.classe}
		             onClick={this.props.onClick}>{this.props.label}</div>);
	}
}

class Calculadora extends React.Component {
	
	constructor() {
		super();
		this.state = {
		  registros: Array(2).fill(null),
		  operador: Array(2).fill(null),
		  registroCorrente: 0,
		};
	}
	
	renderButton(i,c, metodo) {
		const classe = c ? c : "Botao";
		return (<Botao 
		        classe={classe}
				label={i}
				onClick = { () => metodo(i) }	/>);
	}
	
	getValorMostrar() {
		if (this.state.registros[1]) 
			return formatDisplay(this.state.registros[1]);
		if (this.state.registros[0]) 
			return formatDisplay(this.state.registros[0]);
		return this.state.registroCorrente == '0' ? '0': ' ';
	}
	
	entrarNumero(i) {
		
		const reg = this.state.registros.slice();
		
		if ((reg[this.state.registroCorrente]) && (!this.state.operador[this.state.registroCorrente])) { // Não é o primeiro número do registro
			// Máximo de quinze números (tamanho do Display)
			if (reg[this.state.registroCorrente].length == 15) return;
			// Só pode conter uma vírgula (separador decimal)
			if ((i == ',') && (reg[this.state.registroCorrente].indexOf(i) !== -1)) return;
			// Concatena
			reg[this.state.registroCorrente] = reg[this.state.registroCorrente] + i;
		} else { // É o primeiro número do registro ou já tem operador unário no registro
			// Desconsidera zeros à esquerda
			if (i == 0) return;
			// Se a vírgula for digitada em primeiro lugar, adiciona o zero antes dela
			if (i != ',') {
				reg[this.state.registroCorrente] = i.toString();
			} else {
				reg[this.state.registroCorrente] = '0' + i.toString();
			}
		}
		this.setState({registros: reg})
	}
	
	entrarOperadorUnario(i) {
		const reg = this.state.registros.slice();
		const oper = this.state.operador.slice();
		
		if (!reg[this.state.registroCorrente]) {
			if (this.state.registroCorrente == 1) {
				reg[1] = reg[0];
			}
		}
			
		oper[this.state.registroCorrente] = i;
		
		switch(i) {
			case '\u00B1': // + ou -
				if (reg[this.state.registroCorrente].substring(0,1) != '-')
					reg[this.state.registroCorrente] = '-' + reg[this.state.registroCorrente]
				else 
					reg[this.state.registroCorrente] = reg[this.state.registroCorrente].substring(1,reg[this.state.registroCorrente].length);
				break;
			case '\u221A': // sqrt
				reg[this.state.registroCorrente] = Math.sqrt(converte(reg[this.state.registroCorrente])).toString().replace('.',',');
				break;
			case '%':
				if (this.state.registroCorrente == 0) {
					reg[this.state.registroCorrente] = null;
				} else {
					reg[1] = (converte(reg[0]) * converte(reg[1]) / 100.0).toString().replace('.',',');
				}
				break;
			case '1/x':
				reg[this.state.registroCorrente] = (1.0 / converte(reg[this.state.registroCorrente])).toString().replace('.',',');
				break;
		}
		
		this.setState({registros: reg, operador: oper});
	}
	
	entrarOperadorBinario(i) {
		const reg = this.state.registros.slice();
		const oper = this.state.operador.slice();
		const rc = this.state.registroCorrente;
		
		const op = oper[0];
		oper[0] = i;
		
		if (reg[this.state.registroCorrente]) {
		
			if (this.state.registroCorrente == 1) {
				
				switch(op) {
					case '+': // + 
						reg[0] = (converte(reg[0]) + converte(reg[1])).toString().replace('.',',');
						break;
					case '-': // -
					    reg[0] = (converte(reg[0]) - converte(reg[1])).toString().replace('.',',');
						break;
					case '\u00D7': // x
						reg[0] = (converte(reg[0]) * converte(reg[1])).toString().replace('.',',');
						break;
					case '\u00F7': // /
						reg[0] = (converte(reg[0]) / converte(reg[1])).toString().replace('.',',');
						break;
				}
				reg[1] = null;
				oper[1] = null;
				this.setState({registros: reg, operador: oper});
				
			} else {
				this.setState({registros: reg, operador: oper, registroCorrente: (rc + 1) % 2 });
			}
			return;
		}
		this.setState({registros: reg, operador: oper});
	}
	
	evaluate() {
		const reg = this.state.registros.slice();
		const oper = this.state.operador.slice();
		const rc = this.state.registroCorrente;
		
		const op = oper[0];
		oper[0] = '=';
		
		if (this.state.registroCorrente == 1) {
			
			if (!reg[this.state.registroCorrente]) {
				reg[1] = reg[0];
			}
			
			switch(op) {
				case '+': // + 
					reg[0] = (converte(reg[0]) + converte(reg[1])).toString().replace('.',',');
					break;
				case '-': // -
					reg[0] = (converte(reg[0]) - converte(reg[1])).toString().replace('.',',');
					break;
				case '\u00D7': // x
					reg[0] = (converte(reg[0]) * converte(reg[1])).toString().replace('.',',');
					break;
				case '\u00F7': // /
					reg[0] = (converte(reg[0]) / converte(reg[1])).toString().replace('.',',');
					break;
			}
			reg[1] = null;
			oper[1] = null;
			this.setState({registros: reg, operador: oper, registroCorrente: (rc + 1) % 2 });
		} 
		
	}
	
	clear() { // C
		this.setState({
			registros: Array(2).fill(null),
			operador: Array(2).fill(null),
			registroCorrente: 0,
		});
	}
	
	cancelEntry() { // CE
		
		const reg = this.state.registros.slice();
		const oper = this.state.operador.slice();
		
		if (reg[1]) {
			reg[1] = null;
			oper[1] = null;
		} else if (reg[0]) {
			reg[0] = null;
			oper[0] = null;
		}
		
		this.setState({registros: reg, operador: oper});
	}
	
	voltarDigitacao() {
		const reg = this.state.registros.slice();
		if (!this.state.operador[this.state.registroCorrente]) {
			reg[this.state.registroCorrente] = reg[this.state.registroCorrente].substring(0, reg[this.state.registroCorrente].length - 1);
		}
		this.setState({registros: reg});
	}
	
	render() {
		const valor = this.getValorMostrar();
		
		// Códigos unicode utilizados
		// \u2190 : seta para a esquerda (voltar)
		// \u00B1 : + ou -
		// \u221A : sqrt
		// \u00F7 : divide
		// \u00D7 : multiplica
		
		
		return (
			<div className="Calculadora">
			<Titulo/>
			<Mostrador valor={valor}/>
			<div className="Teclado">
				<table>
					<tr>
						<td>{this.renderButton('\u2190', null, () => this.voltarDigitacao())}</td>
						<td>{this.renderButton('CE', null, () => this.cancelEntry())}</td>
						<td>{this.renderButton('C', null, () => this.clear())}</td>
						<td>{this.renderButton('\u00B1', null, (i) => this.entrarOperadorUnario(i))}</td> 
						<td>{this.renderButton('\u221A', null, (i) => this.entrarOperadorUnario(i))}</td> 
					</tr>
					<tr>
						<td>{this.renderButton('7',null,(i) => this.entrarNumero(i))}</td>
						<td>{this.renderButton('8',null,(i) => this.entrarNumero(i))}</td>
						<td>{this.renderButton('9',null,(i) => this.entrarNumero(i))}</td>
						<td>{this.renderButton('\u00F7', null, (i) => this.entrarOperadorBinario(i))}</td> 
						<td>{this.renderButton('%',null,(i) => this.entrarOperadorUnario(i))}</td>
					</tr>
					<tr>
						<td>{this.renderButton('4',null,(i) => this.entrarNumero(i))}</td>
						<td>{this.renderButton('5',null,(i) => this.entrarNumero(i))}</td>
						<td>{this.renderButton('6',null,(i) => this.entrarNumero(i))}</td>
						<td>{this.renderButton('\u00D7',null,(i) => this.entrarOperadorBinario(i))}</td> 
						<td>{this.renderButton('1/x',null,(i) => this.entrarOperadorUnario(i))}</td>
					</tr>
					<tr>
						<td>{this.renderButton('1',null,(i) => this.entrarNumero(i))}</td>
						<td>{this.renderButton('2',null,(i) => this.entrarNumero(i))}</td>
						<td>{this.renderButton('3',null,(i) => this.entrarNumero(i))}</td>
						<td>{this.renderButton('-',null,(i) => this.entrarOperadorBinario(i))}</td>
						<td rowSpan="2">{this.renderButton('=','BotaoDuploVertical', () => this.evaluate())}</td>
					</tr>
					<tr>
						<td colSpan="2">{this.renderButton('0','BotaoDuplo',(i) => this.entrarNumero(i))}</td>
						<td>{this.renderButton(',',null,(i) => this.entrarNumero(i))}</td>
						<td>{this.renderButton('+',null,(i) => this.entrarOperadorBinario(i))}</td>
					</tr>
				</table>
			</div>
			
			</div>
			
		);
	}
}

/* Código para Debug
			<ul>
				<li>Registro Corrente: {this.state.registroCorrente}</li>
				<li>{this.state.registros[0]} {this.state.operador[0]}</li>
				<li>{this.state.registros[1]} {this.state.operador[1]}</li>
			</ul>
*/

class Titulo extends React.Component {
	render() {
		return (
			<div className="Titulo">
			Calculadora
			</div>
		);
	}
	
}

class Mostrador extends React.Component {
	render() {
		return (
			<div className="Mostrador-Externo">
				<div className="Mostrador-Interno">
				{this.props.valor}
				</div>
			</div>
		);
	}
}

function converte(i) {
	return Number(i.replace(',','.'))
}

function formatDisplay(reg) {
	
	var tamanho = reg.indexOf(',');
	var m = Number(reg.replace(',','.'));
	if (tamanho > 1) {
		if (tamanho > 14) {
			return 'overflow';
		} else {
			var result = (Math.round(m * Math.pow(10,14-tamanho))/Math.pow(10,14-tamanho)).toString();
			result = result.replace('.',',');
			return result;
		}
	} else {
		if (m.length > 15) {
			return 'overflow';
		} else {
			var result = (Math.round(m * Math.pow(10,14-tamanho))/Math.pow(10,14-tamanho)).toString();
			result = result.replace('.',',');
			return result;
		}
	}
}

export default App;
