'use strict';

const path = require('path');
const StringUtils = require('../utils/string-utils');
const ObjectUtils = require('../utils/object-utils');
const Pdf = require('pdfkit');
const { Base64Encode } = require('base64-stream');

const GeradorDeLinhaDigitavel = require('./gerador-de-linha-digitavel');
const diretorioDeFontes = path.join(__dirname, '/fontes');
const arial = path.join(diretorioDeFontes, 'arial.ttf');
const arialNegrito = path.join(diretorioDeFontes, 'arial.ttf');
const arialNegritoVdd = path.join(diretorioDeFontes, 'arialbd.ttf');
const timesNewRomanItalico = path.join(diretorioDeFontes, 'Times New Roman Italic.ttf');
const timesNewRomanNegritoItalico = path.join(diretorioDeFontes, 'Times New Roman Bold Italic.ttf');
const arialLite = path.join(diretorioDeFontes, 'arial-mt-light.ttf');
const code25I = path.join(diretorioDeFontes, 'Code25I.ttf');

var GeradorDeBoleto = (function() {
	function GeradorDeBoleto(boletos) {
		if (!Array.isArray(boletos)) {
			boletos = [boletos];
		}

		this._boletos = boletos;
	}

	const pdfDefaults = {
		ajusteY: -80,
		ajusteX: 0,
		autor: '',
		titulo: '',
		criador: '',
		tamanhoDaFonteDoTitulo: 8,
		tamanhoDaFonte: 9,
		tamanhoDaLinhaDigitavel: 13,
		tamanhoDoCodigoDeBarras: 32,
		imprimirSequenciaDoBoleto: true,
		corDoLayout: 'black',
		alturaDaPagina: 595.44,
		larguraDaPagina: 841.68,
		exibirCampoUnidadeBeneficiaria: false,
		template: path.join(__dirname, '/templates/template.pdf'),
		informacoesPersonalizadas: function(pdf, x, y) {}
	};

	GeradorDeBoleto.prototype.gerarPDF = function(args) {
		return new Promise((resolve)=> {
			if (typeof args === 'function') {
				args = pdfDefaults;
			}

			args = ObjectUtils.merge(pdfDefaults, args);

			const boletos = this._boletos;
			const informacoesPersonalizadas = args.informacoesPersonalizadas;
			const pdf = new Pdf({
				size: [
					args.alturaDaPagina,
					args.larguraDaPagina
				],
				info: {
					Author: args.autor,
					Title: args.titulo,
					Creator: args.criador,
				}
			});

			if (args.stream) {
				pdf.pipe(args.stream);
			}

			pdf.registerFont('normal', arial);
			pdf.registerFont('negrito', arialNegrito);
			pdf.registerFont('lite', arialLite);
			pdf.registerFont('italico', timesNewRomanItalico);
			pdf.registerFont('negrito-italico', timesNewRomanNegritoItalico);
			pdf.registerFont('codigoDeBarras', code25I);

			boletos.forEach(function escreveOsDadosDoBoleto(boleto, indice) {
				// DESENHAR LAYOUT

				const banco = boleto.getBanco();
				const pagador = boleto.getPagador();
				const beneficiario = boleto.getBeneficiario();
				var enderecoDoBeneficiario = beneficiario.getEndereco();
				const datas = boleto.getDatas();

				const ESPACO_ENTRE_LINHAS = 23;
				var linha1001 = 111;
				pdf.moveTo(args.ajusteX + 27, args.ajusteY + linha1001)
					.lineTo(args.ajusteX + 572, args.ajusteY + linha1001)
					.stroke(args.corDoLayout);

				var linha1002 = linha1001 + ESPACO_ENTRE_LINHAS;
				pdf.moveTo(args.ajusteX + 27, args.ajusteY + linha1002)
					.lineTo(args.ajusteX + 572, args.ajusteY + linha1002)
					.stroke(args.corDoLayout);

				var linha1003 = linha1002 + ESPACO_ENTRE_LINHAS;
				pdf.moveTo(args.ajusteX + 27, args.ajusteY + linha1003)
					.lineTo(args.ajusteX + 572, args.ajusteY + linha1003)
					.stroke(args.corDoLayout);

				var linha1004 = linha1003 + ESPACO_ENTRE_LINHAS;
				pdf.moveTo(args.ajusteX + 27, args.ajusteY + linha1004)
					.lineTo(args.ajusteX + 572, args.ajusteY + linha1004)
					.stroke(args.corDoLayout);

				var linha1005 = linha1004 + ESPACO_ENTRE_LINHAS;
				pdf.moveTo(args.ajusteX + 27, args.ajusteY + linha1005)
					.lineTo(args.ajusteX + 572, args.ajusteY + linha1005)
					.stroke(args.corDoLayout);
			

				var linha1 = linha1004 + ESPACO_ENTRE_LINHAS + 150;
				pdf.moveTo(args.ajusteX + 27, args.ajusteY + linha1)
					.lineTo(args.ajusteX + 572, args.ajusteY + linha1)
					.stroke(args.corDoLayout);

				var linha2 = linha1 + ESPACO_ENTRE_LINHAS;
				pdf.moveTo(args.ajusteX + 27, args.ajusteY + linha2)
					.lineTo(args.ajusteX + 572, args.ajusteY + linha2)
					.stroke(args.corDoLayout);

				var linha3 = linha2 + ESPACO_ENTRE_LINHAS;
				pdf.moveTo(args.ajusteX + 27, args.ajusteY + linha3)
					.lineTo(args.ajusteX + (banco.exibirReciboDoPagadorCompleto() ? 572 : 329), args.ajusteY + linha3)
					.stroke(args.corDoLayout);

				if (banco.exibirReciboDoPagadorCompleto()) {
					var linha4Opcional = linha3 + ESPACO_ENTRE_LINHAS;
					// pdf.moveTo(args.ajusteX + 27, args.ajusteY + linha4Opcional)
					// 	.lineTo(args.ajusteX + 329, args.ajusteY + linha4Opcional)
					// 	.stroke(args.corDoLayout);
				}

				var coluna1 = 27;
				pdf.moveTo(args.ajusteX + coluna1, args.ajusteY + linha1001 - 0.5)
					.lineTo(args.ajusteX + coluna1, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha3 : linha3) + 0.5)
					.stroke(args.corDoLayout);

				var coluna1001 = 117;
				pdf.moveTo(args.ajusteX + coluna1001, args.ajusteY + linha1001 - 0.5)
					.lineTo(args.ajusteX + coluna1001, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha1002 : linha1002) + 0.5)
					.stroke(args.corDoLayout);

				var coluna1002 = 177;
				pdf.moveTo(args.ajusteX + coluna1002, args.ajusteY + linha1001 - 0.5)
					.lineTo(args.ajusteX + coluna1002, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha1002 : linha1002) + 0.5)
					.stroke(args.corDoLayout);

				var coluna1003 = 330;
				pdf.moveTo(args.ajusteX + coluna1003, args.ajusteY + linha1002 - 0.5)
					.lineTo(args.ajusteX + coluna1003, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha1003 : linha1003) + 0.5)
					.stroke(args.corDoLayout);

				var coluna1004 = 450;
				pdf.moveTo(args.ajusteX + coluna1004, args.ajusteY + linha1002 - 0.5)
					.lineTo(args.ajusteX + coluna1004, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha1005 : linha1005) + 0.5)
					.stroke(args.corDoLayout);

				var coluna1005 = 400;
				pdf.moveTo(args.ajusteX + coluna1005, args.ajusteY + linha1003 - 0.5)
					.lineTo(args.ajusteX + coluna1005, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha1004 : linha1004) + 0.5)
					.stroke(args.corDoLayout);
				
				var coluna1006 = 115;
				pdf.moveTo(args.ajusteX + coluna1006, args.ajusteY + linha1004 - 0.5)
					.lineTo(args.ajusteX + coluna1006, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha1005 : linha1005) + 0.5)
					.stroke(args.corDoLayout);

				var coluna1007 = 220;
				pdf.moveTo(args.ajusteX + coluna1007, args.ajusteY + linha1004 - 0.5)
					.lineTo(args.ajusteX + coluna1007, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha1005 : linha1005) + 0.5)
					.stroke(args.corDoLayout);

				var coluna1008 = 330;
				pdf.moveTo(args.ajusteX + coluna1008, args.ajusteY + linha1004 - 0.5)
					.lineTo(args.ajusteX + coluna1008, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha1005 : linha1005) + 0.5)
					.stroke(args.corDoLayout);

				var coluna2 = 329;
				pdf.moveTo(args.ajusteX + coluna2, args.ajusteY + linha2)
					.lineTo(args.ajusteX + coluna2, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha3 : linha3) + 0.5)
					.stroke(args.corDoLayout);

				var coluna3 = 178;
				pdf.moveTo(args.ajusteX + coluna3, args.ajusteY + linha2)
					.lineTo(args.ajusteX + coluna3, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha2 : linha2))
					.stroke(args.corDoLayout);

				var coluna4 = 420;
				pdf.moveTo(args.ajusteX + coluna4, args.ajusteY + linha2)
					.lineTo(args.ajusteX + coluna4, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha3 : linha2))
					.stroke(args.corDoLayout);

				var coluna5 = 572;
				pdf.moveTo(args.ajusteX + coluna5, args.ajusteY + linha1001 - 0.5)
					.lineTo(args.ajusteX + coluna5, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha3 : linha2) + 0.5)
					.stroke(args.corDoLayout);

				var coluna6 = coluna2 + 4;
				pdf.moveTo(args.ajusteX + coluna6, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha3 : linha2) + 3.5)
					.lineTo(args.ajusteX + coluna6, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha4Opcional : linha3) + 0.5)
					.stroke(args.corDoLayout);

				if (banco.exibirReciboDoPagadorCompleto()) {
					var coluna6Opcional = coluna3;
					pdf.moveTo(args.ajusteX + coluna6Opcional, args.ajusteY + linha2 - 0.5)
						.lineTo(args.ajusteX + coluna6Opcional, args.ajusteY + linha3 + 0.5)
						.stroke(args.corDoLayout);

					var coluna8Opcional = coluna1 + 75.5;
					pdf.moveTo(args.ajusteX + coluna8Opcional, args.ajusteY + linha2 - 0.5)
						.lineTo(args.ajusteX + coluna8Opcional, args.ajusteY + linha3 + 0.5)
						.stroke(args.corDoLayout);
				}

				var coluna7 = coluna5;
				pdf.moveTo(args.ajusteX + coluna7, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha3 : linha2) + 3.5)
					.lineTo(args.ajusteX + coluna7, args.ajusteY + (banco.exibirReciboDoPagadorCompleto() ? linha4Opcional : linha3) + 0.5)
					.stroke(args.corDoLayout);

				var linha4 = (banco.exibirReciboDoPagadorCompleto() ? linha3 : linha2) + 4;
				pdf.moveTo(args.ajusteX + coluna6, args.ajusteY + linha4)
					.lineTo(args.ajusteX + coluna7, args.ajusteY + linha4)
					.stroke(args.corDoLayout);

				//////////////////

				var margemDaLinhaSeparadora = 30,
					divisoresVerticais = (linha4Opcional || linha3) + (2 * margemDaLinhaSeparadora) - 4,
					margemDoSegundoBloco = 30,
					margemDoSegundoBlocoLayout = margemDoSegundoBloco - 4,
					alturaDoLogotipoDoBanco = 18;

				var linha21 = divisoresVerticais + alturaDoLogotipoDoBanco + 4;
				pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha21)
					.lineTo(args.ajusteX + 571, args.ajusteY + linha21)
					.stroke(args.corDoLayout);

				var linha22 = linha21 + ESPACO_ENTRE_LINHAS + 8;
				pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha22)
					.lineTo(args.ajusteX + 571, args.ajusteY + linha22)
					.stroke(args.corDoLayout);

				var linha23 = linha22 + ESPACO_ENTRE_LINHAS;
				pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha23)
					.lineTo(args.ajusteX + 571, args.ajusteY + linha23)
					.stroke(args.corDoLayout);

				var linha24 = linha23 + ESPACO_ENTRE_LINHAS;
				pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha24)
					.lineTo(args.ajusteX + 571, args.ajusteY + linha24)
					.stroke(args.corDoLayout);

				var linha25 = linha24 + ESPACO_ENTRE_LINHAS;
				pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha25)
					.lineTo(args.ajusteX + 571, args.ajusteY + linha25)
					.stroke(args.corDoLayout);

				var camposLaterais = 434,
					linha26 = linha25 + ESPACO_ENTRE_LINHAS;

				pdf.moveTo(args.ajusteX + camposLaterais, args.ajusteY + linha26)
					.lineTo(args.ajusteX + 571, args.ajusteY + linha26)
					.stroke(args.corDoLayout);

				var linha27 = linha26 + ESPACO_ENTRE_LINHAS;
				pdf.moveTo(args.ajusteX + camposLaterais, args.ajusteY + linha27)
					.lineTo(args.ajusteX + 571, args.ajusteY + linha27)
					.stroke(args.corDoLayout);

				var linha28 = linha27 + ESPACO_ENTRE_LINHAS;
				pdf.moveTo(args.ajusteX + camposLaterais, args.ajusteY + linha28)
					.lineTo(args.ajusteX + 571, args.ajusteY + linha28)
					.stroke(args.corDoLayout);

				if (args.exibirCampoUnidadeBeneficiaria) {
					var linha28_2 = linha28 + 12.4;
					pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha28_2)
						.lineTo(args.ajusteX + camposLaterais, args.ajusteY + linha28_2)
						.stroke(args.corDoLayout);
				}

				var linha29 = linha28 + ESPACO_ENTRE_LINHAS;
				pdf.moveTo(args.ajusteX + camposLaterais, args.ajusteY + linha29)
					.lineTo(args.ajusteX + 571, args.ajusteY + linha29)
					.stroke(args.corDoLayout);

				var linha211 = linha29 + ESPACO_ENTRE_LINHAS + 0.4;
				pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha211)
					.lineTo(args.ajusteX + 571, args.ajusteY + linha211)
					.stroke(args.corDoLayout);

				var linha212 = linha211 + 56.6;
				pdf.moveTo(args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha212)
					.lineTo(args.ajusteX + 571, args.ajusteY + linha212)
					.stroke(args.corDoLayout);

				var coluna21 = margemDoSegundoBlocoLayout + 0.5;
				pdf.moveTo(args.ajusteX + coluna21, args.ajusteY + linha21)
					.lineTo(args.ajusteX + coluna21, args.ajusteY + linha212)
					.stroke(args.corDoLayout);

				var coluna22 = 571 - 0.5;
				pdf.moveTo(args.ajusteX + coluna22, args.ajusteY + linha21)
					.lineTo(args.ajusteX + coluna22, args.ajusteY + linha212)
					.stroke(args.corDoLayout);

				var coluna23 = camposLaterais;
				pdf.moveTo(args.ajusteX + coluna23, args.ajusteY + linha21)
					.lineTo(args.ajusteX + coluna23, args.ajusteY + linha211)
					.stroke(args.corDoLayout);

				var coluna24 = 93.5;
				pdf.moveTo(args.ajusteX + coluna24, args.ajusteY + linha23)
					.lineTo(args.ajusteX + coluna24, args.ajusteY + linha24)
					.stroke(args.corDoLayout);

				if (banco.exibirCampoCip()) {
					pdf.moveTo(args.ajusteX + coluna24, args.ajusteY + linha24)
						.lineTo(args.ajusteX + coluna24, args.ajusteY + linha25)
						.stroke(args.corDoLayout);
				}

				var coluna25 = coluna24 + 92.5;
				pdf.moveTo(args.ajusteX + coluna25, args.ajusteY + linha23)
					.lineTo(args.ajusteX + coluna25, args.ajusteY + linha24)
					.stroke(args.corDoLayout);

				var coluna26 = coluna25 + 84.5;
				pdf.moveTo(args.ajusteX + coluna26, args.ajusteY + linha23)
					.lineTo(args.ajusteX + coluna26, args.ajusteY + linha24)
					.stroke(args.corDoLayout);

				var coluna27 = coluna26 + 61;
				pdf.moveTo(args.ajusteX + coluna27, args.ajusteY + linha23)
					.lineTo(args.ajusteX + coluna27, args.ajusteY + linha24)
					.stroke(args.corDoLayout);

				var coluna28 = margemDoSegundoBlocoLayout + 106;
				pdf.moveTo(args.ajusteX + coluna28, args.ajusteY + linha24)
					.lineTo(args.ajusteX + coluna28, args.ajusteY + linha25)
					.stroke(args.corDoLayout);

				var coluna29 = coluna28 + 76.5;
				pdf.moveTo(args.ajusteX + coluna29, args.ajusteY + linha24)
					.lineTo(args.ajusteX + coluna29, args.ajusteY + linha25)
					.stroke(args.corDoLayout);

				var coluna210 = coluna29 + 77;
				pdf.moveTo(args.ajusteX + coluna210, args.ajusteY + linha24)
					.lineTo(args.ajusteX + coluna210, args.ajusteY + linha25)
					.stroke(args.corDoLayout);

				var coluna211 = coluna210 + 92;
				pdf.moveTo(args.ajusteX + coluna211, args.ajusteY + linha24)
					.lineTo(args.ajusteX + coluna211, args.ajusteY + linha25)
					.stroke(args.corDoLayout);

				var coluna212 = 154;
				pdf.moveTo(args.ajusteX + coluna212, args.ajusteY + divisoresVerticais)
					.lineTo(args.ajusteX + coluna212, args.ajusteY + linha21)
					.stroke(args.corDoLayout);

				var coluna213 = coluna212 + 1;
				pdf.moveTo(args.ajusteX + coluna213, args.ajusteY + divisoresVerticais)
					.lineTo(args.ajusteX + coluna213, args.ajusteY + linha21)
					.stroke(args.corDoLayout);

				var coluna214 = coluna213 + 1;
				pdf.moveTo(args.ajusteX + coluna214, args.ajusteY + divisoresVerticais)
					.lineTo(args.ajusteX + coluna214, args.ajusteY + linha21)
					.stroke(args.corDoLayout);

				var coluna215 = coluna214 + 41.5;
				pdf.moveTo(args.ajusteX + coluna215, args.ajusteY + divisoresVerticais)
					.lineTo(args.ajusteX + coluna215, args.ajusteY + linha21)
					.stroke(args.corDoLayout);

				var coluna216 = coluna215 + 1;
				pdf.moveTo(args.ajusteX + coluna216, args.ajusteY + divisoresVerticais)
					.lineTo(args.ajusteX + coluna216, args.ajusteY + linha21)
					.stroke(args.corDoLayout);

				var coluna217 = coluna216 + 1;
				pdf.moveTo(args.ajusteX + coluna217, args.ajusteY + divisoresVerticais)
					.lineTo(args.ajusteX + coluna217, args.ajusteY + linha21)
					.stroke(args.corDoLayout);

				var linhaSeparadora = (linha4Opcional || linha3) + margemDaLinhaSeparadora;

				pdf.moveTo(args.ajusteX + 27, args.ajusteY + linhaSeparadora)
					.lineTo(args.ajusteX + 572, args.ajusteY + linhaSeparadora)
					.dash(3, { space: 5 })
					.stroke(args.corDoLayout);

				var caminhoParaTesoura = path.join(__dirname, 'imagens/tesoura128.png');
				pdf.image(caminhoParaTesoura, args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linhaSeparadora - 3.2, {
					width: 10
				});

				/// IMPRIMIR LAYOUT
				var titulos = ObjectUtils.merge({
					instrucoes: 'Instruções',
					dataDocumento: 'Data Documento',
					nomeDoPagador: 'Pagador',
					agenciaECodigoDoBeneficiario: 'Agência / Código do Beneficiário',
					nossoNumero: 'Nosso Número',
					especie: 'Espécie',
					especieDoDocumento: 'Espécie Doc.',
					quantidade: 'Quantidade',
					numeroDoDocumento: 'Nr. do Documento',
					dataDeProcessamento: 'Data do processamento',
					valorDoDocumento: 'Valor do Documento',
					valor: 'Valor',
					carteira: 'Carteira',
					moraMulta: '(+)Mora/Multa/Juros',
					localDoPagamento: 'Local do Pagamento',
					igualDoValorDoDocumento: '(=) '
				}, banco.getTitulos ? banco.getTitulos() : {});

				args.creditos && pdf.font('italico')
					.fontSize(8)
					.text(args.creditos, args.ajusteX + 3, args.ajusteY + 90, {
						width: 560,
						align: 'center'
					});

				var zeroLinha = 108;
				const codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto);
				const linhaDigitavel = GeradorDeLinhaDigitavel(codigoDeBarras, banco, banco.getNumeroFormatadoComDigito());

				pdf.image(banco.getImagem(), args.ajusteX + 29, args.ajusteY + zeroLinha + 5, {
					height: alturaDoLogotipoDoBanco
				});

				pdf.font('negrito')
					.fontSize(args.tamanhoDaLinhaDigitavel)
					.text(banco.getNumeroFormatadoComDigito(), args.ajusteX + 125, args.ajusteY + zeroLinha + 8, {
						lineBreak: false,
						width: 39.8,
						align: 'center'
					});

				pdf.font('negrito')
					.fontSize(args.tamanhoDaLinhaDigitavel)
					.text(linhaDigitavel, args.ajusteX + 170, args.ajusteY + zeroLinha + 8, {
						lineBreak: false,
						width: 400,
						align: 'right'
					});


				// ======================================================================================================
				
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('Beneficiário', args.ajusteX + 29, args.ajusteY + zeroLinha + 27, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(beneficiario._nome.toUpperCase(), args.ajusteX + 29, args.ajusteY + zeroLinha + 27 + args.tamanhoDaFonte + 1, {
						lineBreak: false,
						width: 545,
						align: 'left'
					});
				// ======================================================================================================

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('CPF/CNPJ', args.ajusteX + 333, args.ajusteY + zeroLinha + 27, {
						lineBreak: false,
						width: 294,
						align: 'left'
					}); 

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(beneficiario._registroNacional, args.ajusteX + 333, args.ajusteY + zeroLinha + 37, {
						lineBreak: false,
						width: 545,
						align: 'left'
						});
				// ======================================================================================================

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.agenciaECodigoDoBeneficiario, args.ajusteX + 453, args.ajusteY + zeroLinha + 27, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('lite')
					.fontSize(args.tamanhoDaFonte)
					.text(`${beneficiario._agencia}/1105459-0`, args.ajusteX + 453, args.ajusteY + zeroLinha + 27 + args.tamanhoDaFonte + 1, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});
				// ======================================================================================================
				
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('Endereço do beneficiário', args.ajusteX + 29, args.ajusteY + zeroLinha + 50, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(enderecoDoBeneficiario.getPrimeiraLinha(), args.ajusteX + 29, args.ajusteY + zeroLinha + 60, {
						lineBreak: false,
						width: 545,
						align: 'left'
						});
				// ======================================================================================================

				const firstSplit = enderecoDoBeneficiario.getSegundaLinha().split('/'); 
				const ufCep = firstSplit[1].split('—');
				
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('UF', args.ajusteX + 404, args.ajusteY + zeroLinha + 50, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

					
				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(ufCep[0], args.ajusteX + 404, args.ajusteY + zeroLinha + 60, {
						lineBreak: false,
						width: 545,
						align: 'left'
					});
				// ======================================================================================================

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('CEP', args.ajusteX + 454, args.ajusteY + zeroLinha + 50, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(ufCep[1], args.ajusteX + 454, args.ajusteY + zeroLinha + 60, {
						lineBreak: false,
						width: 545,
						align: 'left'
					});
				// ======================================================================================================

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.dataDocumento, args.ajusteX + 29, args.ajusteY + zeroLinha + 73, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(datas.getDocumentoFormatado(), args.ajusteX + 29, args.ajusteY + zeroLinha + 82, {
						lineBreak: false,
						width: 61.5,
						align: 'left'
					});
				// ======================================================================================================
				
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.numeroDoDocumento, args.ajusteX + 118, args.ajusteY + zeroLinha + 73, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
						.fontSize(args.tamanhoDaFonte)
						.text(StringUtils.pad(boleto.getNumeroDoDocumentoFormatado(boleto), 8, '0'), args.ajusteX + 118, args.ajusteY + zeroLinha + 82, {
							lineBreak: false,
							width: 294,
							align: 'left'
						});
				// ======================================================================================================

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('Aceite', args.ajusteX + 222, args.ajusteY + zeroLinha + 73, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(boleto.getAceiteFormatado(), args.ajusteX + 222, args.ajusteY + zeroLinha + 82, {
						lineBreak: false,
						width: 55,
						align: 'center'
					});
				// ======================================================================================================

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.dataDeProcessamento, args.ajusteX + 332, args.ajusteY + zeroLinha + 73, {
						lineBreak: false,
						width: 294,
						align: 'left'
					}); 

				pdf.font('normal')
						.fontSize(args.tamanhoDaFonte)
						.text(datas.getProcessamentoFormatado(), args.ajusteX + 332, args.ajusteY + zeroLinha + 82, {
							lineBreak: false,
							width: 294,
							align: 'left'
						});
				// ======================================================================================================

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.nossoNumero, args.ajusteX + 452, args.ajusteY + zeroLinha + 73, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(StringUtils.pad(banco.getNossoNumeroECodigoDocumento(boleto), 8, '0'), args.ajusteX + 452, args.ajusteY + zeroLinha + 82, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});
				// ======================================================================================================
				
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.instrucoes, args.ajusteX + 29, args.ajusteY + zeroLinha + 97, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				var instrucaoY = tituloDaSetimaLinha + 52;
				boleto.getInstrucoes().forEach(function(instrucao, indice) {
					pdf.font('normal')
						.fontSize(args.tamanhoDaFonte)
						.text(instrucao, args.ajusteX + 29, args.ajusteY + zeroLinha + 110 + (indice * args.tamanhoDaFonte), {
							lineBreak: false,
							width: 400,
							align: 'left'
						});
				});
				// ======================================================================================================

				var primeiraLinha = linha1 + 11,
					diferencaEntreTituloEValor = 10,
					tituloDaPrimeiraLinha = primeiraLinha - diferencaEntreTituloEValor;

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('Pagador', args.ajusteX + 29, args.ajusteY + tituloDaPrimeiraLinha, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonteDoTitulo) // TODO: Diminuir tamanho da fonte caso seja maior que X caracteres
					.text(pagador._nome, args.ajusteX + 29, args.ajusteY + primeiraLinha, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});
				// ======================================================================================================
				
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('CPF/CNPJ:', args.ajusteX + 420, args.ajusteY + tituloDaPrimeiraLinha, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(pagador._registroNacional, args.ajusteX + 465, args.ajusteY + tituloDaPrimeiraLinha, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});
				// ======================================================================================================

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('UF:', args.ajusteX + 420, args.ajusteY + tituloDaPrimeiraLinha + 11, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(pagador._endereco._uf, args.ajusteX + 435, args.ajusteY + tituloDaPrimeiraLinha + 11, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});
				// ======================================================================================================

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('CEP:', args.ajusteX + 465, args.ajusteY + tituloDaPrimeiraLinha + 11, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});
					
				pdf.font('normal')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(pagador._endereco._cep, args.ajusteX + 485, args.ajusteY + tituloDaPrimeiraLinha + 11, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});
				// ======================================================================================================

				// var enderecoDoBeneficiario = beneficiario.getEndereco();

				// if (enderecoDoBeneficiario) {
				// 	var zeroUmLinha = zeroLinha + 2 + args.tamanhoDaFonte + args.tamanhoDaFonte,
				// 		zeroDoisLinha = zeroUmLinha + 1 + args.tamanhoDaFonte;

				// 	if (enderecoDoBeneficiario.getPrimeiraLinha()) {
				// 		pdf.font('normal')
				// 			.fontSize(args.tamanhoDaFonte)
				// 			.text(enderecoDoBeneficiario.getPrimeiraLinha(), args.ajusteX + 27, args.ajusteY + zeroUmLinha, {
				// 				lineBreak: false,
				// 				width: 545,
				// 				align: 'left'
				// 			});

				// 		espacamento += espacamento;
				// 	}

				// 	if (enderecoDoBeneficiario.getSegundaLinha()) {
				// 		pdf.font('normal')
				// 			.fontSize(args.tamanhoDaFonte)
				// 			.text(enderecoDoBeneficiario.getSegundaLinha(), args.ajusteX + 27, args.ajusteY + zeroDoisLinha, {
				// 				lineBreak: false,
				// 				width: 545,
				// 				align: 'left'
				// 			});
				// 	}
				// }

				// pdf.font('negrito')
				// 	.fontSize(args.tamanhoDaFonteDoTitulo)
				// 	.text('RECIBO DO PAGADOR', args.ajusteX + 278, args.ajusteY + zeroLinha, {
				// 		lineBreak: false,
				// 		width: 294,
				// 		align: 'right'
				// 	});

				

				

				

				// pdf.font('normal')
				// 	.fontSize(args.tamanhoDaFonte)
				// 	.text(datas.getVencimentoFormatado(), args.ajusteX + 332, args.ajusteY + primeiraLinha, {
				// 		lineBreak: false,
				// 		width: 294,
				// 		align: 'left'
				// 	});

				// pdf.font('negrito')
				// 	.fontSize(args.tamanhoDaFonteDoTitulo)
				// 	.text('Valor Cobrado', args.ajusteX + 424, args.ajusteY + tituloDaPrimeiraLinha, {
				// 		lineBreak: false,
				// 		width: 294,
				// 		align: 'left'
				// 	});

				var primeiraLinhaOpcional = primeiraLinha + ESPACO_ENTRE_LINHAS,
					tituloDaPrimeiraLinhaOpcional = primeiraLinhaOpcional - diferencaEntreTituloEValor;

				if (banco.exibirReciboDoPagadorCompleto()) {
					pdf.font('negrito')
						.fontSize(args.tamanhoDaFonteDoTitulo)
						.text(titulos.carteira, args.ajusteX + 29, args.ajusteY + tituloDaPrimeiraLinhaOpcional, {
							lineBreak: false,
							width: 294,
							align: 'left'
						});

					pdf.font('normal')
						.fontSize(args.tamanhoDaFonte)
						.text(banco.getCarteiraTexto(beneficiario), args.ajusteX + 29, args.ajusteY + primeiraLinhaOpcional, {
							lineBreak: false,
							width: 40,
							align: 'left'
						});

					pdf.font('negrito')
						.fontSize(args.tamanhoDaFonteDoTitulo)
						.text(titulos.especieDoDocumento, args.ajusteX + 105, args.ajusteY + tituloDaPrimeiraLinhaOpcional, {
							lineBreak: false,
							width: 294,
							align: 'left'
						});

					pdf.font('normal')
						.fontSize(args.tamanhoDaFonte)
						.text(boleto.getEspecieDocumento(), args.ajusteX + 105, args.ajusteY + primeiraLinhaOpcional, {
							lineBreak: false,
							width: 40,
							align: 'left'
						});

					pdf.font('negrito')
						.fontSize(args.tamanhoDaFonteDoTitulo)
						.text('Vencimento', args.ajusteX + 181, args.ajusteY + tituloDaPrimeiraLinhaOpcional, {
							lineBreak: false,
							width: 294,
							align: 'left'
						});

					pdf.font('normal')
						.fontSize(args.tamanhoDaFonte)
						.text(datas.getVencimentoFormatado(), args.ajusteX + 181, args.ajusteY + primeiraLinhaOpcional, {
							lineBreak: false,
							width: 294,
							align: 'left'
						});

					pdf.font('negrito')
						.fontSize(args.tamanhoDaFonteDoTitulo)
						.text(titulos.valorDoDocumento, args.ajusteX + 332, args.ajusteY + tituloDaPrimeiraLinhaOpcional, {
							lineBreak: false,
							width: 294,
							align: 'left'
						});
		
					pdf.font('normal')
						.fontSize(args.tamanhoDaFonte)
						.text(boleto.getValorFormatadoBRL(), args.ajusteX + 332, args.ajusteY + primeiraLinhaOpcional, {
							lineBreak: false,
							width: 294,
							align: 'left'
						});

					pdf.font('negrito')
						.fontSize(args.tamanhoDaFonteDoTitulo)
						.text('Valor cobrado', args.ajusteX + 424, args.ajusteY + tituloDaPrimeiraLinhaOpcional, {
							lineBreak: false,
							width: 294,
							align: 'left'
						});
				}

				var segundaLinha = banco.exibirReciboDoPagadorCompleto() ? primeiraLinhaOpcional + ESPACO_ENTRE_LINHAS : primeiraLinha + ESPACO_ENTRE_LINHAS,
					tituloDaSegundaLinha = segundaLinha - diferencaEntreTituloEValor;

				// pdf.font('negrito')
				// 	.fontSize(args.tamanhoDaFonteDoTitulo)
				// 	.text(titulos.agenciaECodigoDoBeneficiario, args.ajusteX + 32, args.ajusteY + tituloDaSegundaLinha, {
				// 		lineBreak: false,
				// 		width: 294,
				// 		align: 'left'
				// 	});

				// +++++++++++++++++++++++++++++++++++++++++++++++++++++++ SAC CAIXA +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
				pdf.font('negrito')
					.fontSize(8)
					.text('SAC CAIXA: 0800 726 0101 (informações, reclamações, sugestões e elogios)', args.ajusteX + 40, args.ajusteY + segundaLinha - 8, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('negrito')
					.fontSize(8)
					.text('Para pessoas com deficiência auditiva ou de fala: 0800 726 2492)', args.ajusteX + 60, args.ajusteY + segundaLinha + 1, {
						lineBreak: false,
						width: 294,
						align: 'left'
					}); 
				
				pdf.font('negrito')
					.fontSize(8)
					.text('Ouvidoria: 0800 725 7474', args.ajusteX + 130, args.ajusteY + segundaLinha + 10, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});
				
				pdf.font('negrito')
					.fontSize(8)
					.text('caixa.gov.br', args.ajusteX + 160, args.ajusteY + segundaLinha + 18, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});
				
				// +++++++++++++++++++++++++++++++++++++++++++++++++++++++ SAC CAIXA +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 

				pdf.font('negrito')
					.fontSize(8)
					.text('Autenticação Mecânica', args.ajusteX + 360, args.ajusteY + segundaLinha - 5, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font(arialNegritoVdd)
					.fontSize(8)
					.text('- Recibo do Pagador', args.ajusteX + 230, args.ajusteY + segundaLinha - 5, {
						lineBreak: false,
						width: 294,
						align: 'right'
					});

				const segundaLinha2 = linha21 - 20.25;				

				pdf.image(banco.getImagem(), args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + segundaLinha2 - 5, {
					height: alturaDoLogotipoDoBanco
				});

				banco.getImprimirNome() && pdf.font('negrito')
					.fontSize(args.tamanhoDaLinhaDigitavel)
					.text(banco.getNome(), args.ajusteX + margemDoSegundoBlocoLayout + 26, args.ajusteY + segundaLinha2, {
						lineBreak: false,
						width: 100,
						align: 'left'
					});

				pdf.font('negrito')
					.fontSize(args.tamanhoDaLinhaDigitavel)
					.text(banco.getNumeroFormatadoComDigito(), args.ajusteX + margemDoSegundoBlocoLayout + 131, args.ajusteY + segundaLinha2, {
						lineBreak: false,
						width: 39.8,
						align: 'center'
					});

				pdf.font('negrito')
					.fontSize(args.tamanhoDaLinhaDigitavel)
					.text(linhaDigitavel, args.ajusteX + margemDoSegundoBlocoLayout + 145, args.ajusteY + segundaLinha2, {
						lineBreak: false,
						width: 400,
						align: 'right'
					});

				function i25(text) { // TODO: MUDAR PARA O GAMMAUTILS ASAP
					if (text.length % 2 !== 0) {
						throw new Error('Text must have an even number of characters');
					}

					var start = String.fromCharCode(201),
						stop = String.fromCharCode(202);

					return text.match(/.{2}/g).reduce(function(acc, part) {
						var value = parseInt(part, 10),
							ascii;

						if (value >= 0 && value <= 93) {
							ascii = value + 33;
						}

						if (value >= 94 && value <= 99) {
							ascii = value + 101;
						}

						return acc + String.fromCharCode(ascii);
					}, start) + stop;
				}

				pdf.font('codigoDeBarras')
					.fontSize(args.tamanhoDoCodigoDeBarras)
					.text(i25(codigoDeBarras), args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha212 + 3.5, {
						lineBreak: false,
						width: 340,
						align: 'left'
					});

				var terceiraLinha = segundaLinha2 + 38,
					tituloDaTerceiraLinha = terceiraLinha - diferencaEntreTituloEValor,
					tituloDaTerceiraLinhaLateral = terceiraLinha - diferencaEntreTituloEValor,
					colunaLateral = 440;

				var tituloLocalDoPagamento = margemDoSegundoBloco;
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.localDoPagamento, args.ajusteX + tituloLocalDoPagamento, args.ajusteY + tituloDaTerceiraLinha - 7, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				boleto.getLocaisDePagamento().forEach(function(localDePagamento, indice) {
					if (indice > 1) {
						return;
					}

					pdf.font('normal')
						.fontSize(args.tamanhoDaFonte)
						.text(localDePagamento, args.ajusteX + margemDoSegundoBloco, args.ajusteY + (terceiraLinha + 2 - args.tamanhoDaFonte + (indice * args.tamanhoDaFonte)), {
							lineBreak: false,
							width: 400,
							align: 'left'
						});
				});

				var tamanhoDasCelulasADireita = 124.5;

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('Vencimento', args.ajusteX + colunaLateral, args.ajusteY + tituloDaTerceiraLinhaLateral - 7, {
						lineBreak: false,
						width: tamanhoDasCelulasADireita,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(datas.getVencimentoFormatado(), args.ajusteX + colunaLateral, args.ajusteY + terceiraLinha, {
						lineBreak: false,
						width: tamanhoDasCelulasADireita,
						align: 'right'
					});

				var quartaLinha = terceiraLinha + 24,
					tituloDaQuartaLinhaLateral = quartaLinha - diferencaEntreTituloEValor;

				var tituloBeneficiario = margemDoSegundoBloco;
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('Beneficiário', args.ajusteX + tituloBeneficiario, args.ajusteY + tituloDaQuartaLinhaLateral, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(`${beneficiario.getIdentificacao()}   (CNPJ: ${beneficiario._registroNacional})`, args.ajusteX + margemDoSegundoBloco, args.ajusteY + quartaLinha, {
						lineBreak: false,
						width: 400,
						align: 'left'
					});

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.agenciaECodigoDoBeneficiario, args.ajusteX + colunaLateral, args.ajusteY + tituloDaQuartaLinhaLateral, {
						lineBreak: false,
						width: tamanhoDasCelulasADireita,
						align: 'left'
					});

				pdf.font('lite')
					.fontSize(args.tamanhoDaFonte)
					.text(`${beneficiario._agencia}/1105459-0`, args.ajusteX + colunaLateral, args.ajusteY + quartaLinha, {
						lineBreak: false,
						width: tamanhoDasCelulasADireita,
						align: 'right'
					});

				var quintaLinha = quartaLinha + ESPACO_ENTRE_LINHAS,
					tituloDaQuintaLinha = quintaLinha - diferencaEntreTituloEValor,
					tituloDaQuintaLinhaLateral = quintaLinha - diferencaEntreTituloEValor;

				var tituloDataDocumento = margemDoSegundoBloco;
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.dataDocumento, args.ajusteX + tituloDataDocumento, args.ajusteY + tituloDaQuintaLinha, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(datas.getDocumentoFormatado(), args.ajusteX + margemDoSegundoBloco, args.ajusteY + quintaLinha, {
						lineBreak: false,
						width: 61.5,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(boleto.getNumeroDoDocumentoFormatado(), args.ajusteX + margemDoSegundoBloco + 68, args.ajusteY + quintaLinha, {
						lineBreak: false,
						width: 84,
						align: 'left'
					});

				var tituloNumeroDoDocumento = tituloDataDocumento + 68,
					tituloCip = tituloNumeroDoDocumento;

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.numeroDoDocumento, args.ajusteX + tituloNumeroDoDocumento, args.ajusteY + tituloDaQuintaLinha, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				var tituloEspecieDoc = tituloNumeroDoDocumento + 90;
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.especieDoDocumento, args.ajusteX + tituloEspecieDoc, args.ajusteY + tituloDaQuintaLinha, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(boleto.getEspecieDocumento(), args.ajusteX + margemDoSegundoBloco + 68 + 90, args.ajusteY + quintaLinha, {
						lineBreak: false,
						width: 81,
						align: 'center'
					});

				var tituloAceite = tituloEspecieDoc + 86;
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('Aceite', args.ajusteX + tituloAceite, args.ajusteY + tituloDaQuintaLinha, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(boleto.getAceiteFormatado(), args.ajusteX + margemDoSegundoBloco + 68 + 90 + 86, args.ajusteY + quintaLinha, {
						lineBreak: false,
						width: 55,
						align: 'center'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(datas.getProcessamentoFormatado(), args.ajusteX + margemDoSegundoBloco + 68 + 90 + 86 + 61.5, args.ajusteY + quintaLinha, {
						lineBreak: false,
						width: 93.5,
						align: 'left'
					});

				var tituloDataProcessamento = tituloAceite + 61;
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.dataDeProcessamento, args.ajusteX + tituloDataProcessamento, args.ajusteY + tituloDaQuintaLinha, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.nossoNumero, args.ajusteX + colunaLateral, args.ajusteY + tituloDaQuintaLinhaLateral, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(banco.getNossoNumeroECodigoDocumento(boleto), args.ajusteX + colunaLateral, args.ajusteY + quintaLinha, {
						lineBreak: false,
						width: tamanhoDasCelulasADireita,
						align: 'right'
					});

				var sextaLinha = quintaLinha + ESPACO_ENTRE_LINHAS,
					tituloDaSextaLinha = sextaLinha - diferencaEntreTituloEValor;

				var tituloUsoDoBancoX = margemDoSegundoBloco;
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('Uso do Banco', args.ajusteX + tituloUsoDoBancoX, args.ajusteY + tituloDaSextaLinha, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				if (banco.exibirCampoCip()) {
					pdf.font('negrito')
						.fontSize(args.tamanhoDaFonteDoTitulo)
						.text('CIP', args.ajusteX + tituloCip, args.ajusteY + tituloDaSextaLinha, {
							lineBreak: false,
							width: 31,
							align: 'left'
						});

					// TODO: Implementar campo CIP no boleto
					pdf.font('normal')
						.fontSize(args.tamanhoDaFonte)
						.text('', args.ajusteX + tituloCip, args.ajusteY + sextaLinha, {
							lineBreak: false,
							width: 31,
							align: 'center'
						});
				}

				var tituloCarteira = tituloUsoDoBancoX + 105;
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.carteira, args.ajusteX + tituloCarteira, args.ajusteY + tituloDaSextaLinha, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(banco.getCarteiraTexto(beneficiario), args.ajusteX + margemDoSegundoBloco + 104.5, args.ajusteY + sextaLinha, {
						lineBreak: false,
						width: 71,
						align: 'center'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(boleto.getEspecieMoeda(), args.ajusteX + margemDoSegundoBloco + 104.5 + 77, args.ajusteY + sextaLinha, {
						lineBreak: false,
						width: 71,
						align: 'center'
					});

				var tituloEspecieMoeda = tituloCarteira + 77;
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.especie, args.ajusteX + tituloEspecieMoeda, args.ajusteY + tituloDaSextaLinha, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				var tituloQuantidadeMoeda = tituloEspecieMoeda + 77;
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.quantidade, args.ajusteX + tituloQuantidadeMoeda, args.ajusteY + tituloDaSextaLinha, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				var tituloValorMoeda = tituloQuantidadeMoeda + 92;
				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.valor, args.ajusteX + tituloValorMoeda, args.ajusteY + tituloDaSextaLinha, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.igualDoValorDoDocumento + titulos.valorDoDocumento, args.ajusteX + colunaLateral, args.ajusteY + tituloDaSextaLinha, {
						lineBreak: false,
						width: tamanhoDasCelulasADireita,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonte)
					.text(boleto.getValorFormatadoBRL(), args.ajusteX + colunaLateral, args.ajusteY + sextaLinha, {
						lineBreak: false,
						width: tamanhoDasCelulasADireita,
						align: 'right'
					});

				var setimaLinhaLateral = sextaLinha + ESPACO_ENTRE_LINHAS,
					tituloDaSetimaLinha = tituloDaSextaLinha + ESPACO_ENTRE_LINHAS,
					tituloDaSetimaLinhaLateral = setimaLinhaLateral - diferencaEntreTituloEValor;

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.instrucoes, args.ajusteX + margemDoSegundoBloco, args.ajusteY + tituloDaSetimaLinha, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				var instrucaoY = tituloDaSetimaLinha + 12;
				boleto.getInstrucoes().forEach(function(instrucao, indice) {
					pdf.font('normal')
						.fontSize(args.tamanhoDaFonte)
						.text(instrucao, args.ajusteX + margemDoSegundoBloco, args.ajusteY + instrucaoY + (indice * args.tamanhoDaFonte), {
							lineBreak: false,
							width: 400,
							align: 'left'
						});
				});

				if (args.exibirCampoUnidadeBeneficiaria) {
					pdf.font('negrito')
						.fontSize(args.tamanhoDaFonteDoTitulo)
						.text('Unidade Beneficiária', args.ajusteX + 30, args.ajusteY + tituloDaSetimaLinha + 70, {
							lineBreak: false,
							width: 294,
							align: 'left'
						});
				}
				// ======================================================================================================

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('Pagador:', args.ajusteX + 30, args.ajusteY + tituloDaSetimaLinha + 115, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonteDoTitulo) // TODO: Diminuir tamanho da fonte caso seja maior que X caracteres
					.text(pagador._nome, args.ajusteX + 29, args.ajusteY + tituloDaSetimaLinha + 125, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});
				// ======================================================================================================

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('CPF/CNPJ:', args.ajusteX + 430, args.ajusteY + tituloDaSetimaLinha + 116, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('normal')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(pagador._registroNacional, args.ajusteX + 430, args.ajusteY + tituloDaSetimaLinha + 125, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});
				// ======================================================================================================

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('UF:', args.ajusteX + 430, args.ajusteY + tituloDaSetimaLinha + 145, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(pagador._endereco._uf, args.ajusteX + 445, args.ajusteY + tituloDaSetimaLinha + 145, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});
				// ======================================================================================================

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('CEP:', args.ajusteX + 485, args.ajusteY + tituloDaSetimaLinha + 145, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});
					
				pdf.font('normal')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(pagador._endereco._cep, args.ajusteX + 508, args.ajusteY + tituloDaSetimaLinha + 145, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});
				// ======================================================================================================


				// pdf.font('normal')
				// 	.fontSize(args.tamanhoDaFonte)
				// 	.text(pagador.getIdentificacao(), args.ajusteX + 30, args.ajusteY + tituloDaSetimaLinha + 115 + 10, {
				// 		lineBreak: false,
				// 		width: 535,
				// 		align: 'left'
				// 	});

				// var enderecoDoPagador = pagador.getEndereco();
				// if (enderecoDoPagador) {
				// 	var espacamento = args.tamanhoDaFonte;

				// 	if (enderecoDoPagador.getPrimeiraLinha()) {
				// 		pdf.font('normal')
				// 			.fontSize(args.tamanhoDaFonte)
				// 			.text(enderecoDoPagador.getPrimeiraLinha(), args.ajusteX + 30, args.ajusteY + tituloDaSetimaLinha + 115 + 10 + espacamento, {
				// 				lineBreak: false,
				// 				width: 535,
				// 				align: 'left'
				// 			});

				// 		espacamento += espacamento;
				// 	}

				// 	if (enderecoDoPagador.getSegundaLinha()) {
				// 		pdf.font('normal')
				// 			.fontSize(args.tamanhoDaFonte)
				// 			.text(enderecoDoPagador.getSegundaLinha(), args.ajusteX + 30, args.ajusteY + tituloDaSetimaLinha + 115 + 10 + espacamento, {
				// 				lineBreak: false,
				// 				width: 535,
				// 				align: 'left'
				// 			});
				// 	}
				// }

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('Sacador/Avalista:', args.ajusteX + 29, args.ajusteY + tituloDaSetimaLinha + 160, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('CPF/CNPJ:', args.ajusteX + 430, args.ajusteY + tituloDaSetimaLinha + 160, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('Autenticação Mecânica', args.ajusteX + 360, args.ajusteY + tituloDaSetimaLinha + 173, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				pdf.font(arialNegritoVdd)
					.fontSize(args.tamanhoDaFonteDoTitulo + 1)
					.text('- Ficha de Compensação', args.ajusteX + 402, args.ajusteY + tituloDaSetimaLinha + 173, {
						lineBreak: false,
						width: 150,
						align: 'right'
					});

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('(-) Desconto / Abatimento', args.ajusteX + colunaLateral, args.ajusteY + tituloDaSetimaLinhaLateral, {
						lineBreak: false,
						width: tamanhoDasCelulasADireita,
						align: 'left'
					});

				// if (boleto._valorDescontos !== 'NaN') {
				// 	pdf.font('normal')
				// 	.fontSize(args.tamanhoDaFonte)
				// 	.text(boleto.getValorDescontosFormatadoBRL(), args.ajusteX + colunaLateral, args.ajusteY + setimaLinhaLateral, {
				// 		lineBreak: false,
				// 		width: tamanhoDasCelulasADireita,
				// 		align: 'right'
				// 	});
				// }

				var oitavaLinhaLateral = setimaLinhaLateral + ESPACO_ENTRE_LINHAS,
					tituloDaOitavaLinhaLateral = oitavaLinhaLateral - diferencaEntreTituloEValor;

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('(-) Outras Deduções', args.ajusteX + colunaLateral, args.ajusteY + tituloDaOitavaLinhaLateral, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				// if (boleto._valorDeducoes !== 'NaN') {
				// 	pdf.font('normal')
				// 	.fontSize(args.tamanhoDaFonte)
				// 	.text(boleto.getValorDeducoesFormatadoBRL(), args.ajusteX + colunaLateral, args.ajusteY + oitavaLinhaLateral, {
				// 		lineBreak: false,
				// 		width: 294,
				// 		align: 'left'
				// 	});
				// }

				var nonaLinhaLateral = oitavaLinhaLateral + ESPACO_ENTRE_LINHAS,
					tituloDaNonaLinhaLateral = nonaLinhaLateral - diferencaEntreTituloEValor;

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text(titulos.moraMulta, args.ajusteX + colunaLateral, args.ajusteY + tituloDaNonaLinhaLateral, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				var decimaLinhaLateral = nonaLinhaLateral + ESPACO_ENTRE_LINHAS,
					tituloDaDecimaLinhaLateral = decimaLinhaLateral - diferencaEntreTituloEValor;

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('(+) Outros Acréscimos', args.ajusteX + colunaLateral, args.ajusteY + tituloDaDecimaLinhaLateral, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				var decimaPrimLinhaLateral = decimaLinhaLateral + ESPACO_ENTRE_LINHAS,
					tituloDaDecimaPrimLinhaLateral = decimaPrimLinhaLateral - diferencaEntreTituloEValor;

				pdf.font('negrito')
					.fontSize(args.tamanhoDaFonteDoTitulo)
					.text('(=) Valor Cobrado', args.ajusteX + colunaLateral, args.ajusteY + tituloDaDecimaPrimLinhaLateral, {
						lineBreak: false,
						width: 294,
						align: 'left'
					});

				// args.imprimirSequenciaDoBoleto && pdf.font('italico')
				//  .fontSize(args.tamanhoDaFonte)
				//  .text('Boleto Nº ' + (indice + 1) + '/' + boletos.length, args.ajusteX + 30, args.ajusteY + 10, {
				//      width: 560,
				//      align: 'center'
				//  });

				informacoesPersonalizadas(pdf, args.ajusteX + margemDoSegundoBlocoLayout, args.ajusteY + linha212 + args.tamanhoDoCodigoDeBarras + 10);

				if (indice < boletos.length - 1) {
					pdf.addPage();
				}
			});

			if(args.base64){
				
				var finalString = ''; 
				var stream = pdf.pipe(new Base64Encode());
	
				pdf.end();
	
				stream.on('data', function(chunk) {
					finalString += chunk;
				});
				
				stream.on('end', function() {
					resolve(finalString);
				});
				stream.on('close', function() {
					resolve(finalString);
				});
			}else{
				pdf.end();
				resolve(pdf);
			}
		});
	};

	GeradorDeBoleto.prototype.gerarLinhaDigitavel = function() {
		return new Promise((resolve)=> {
			const boletos = this._boletos;
			const linhaDigitavel = [];
			boletos.forEach((boleto, indice)=> {
				const banco = boleto.getBanco();
				const numeroDocumento = boleto.getNumeroDoDocumentoFormatado();
				const linha = GeradorDeLinhaDigitavel(banco.geraCodigoDeBarrasPara(boleto), banco);
				if (indice <= boletos.length - 1) {
					linhaDigitavel.push({linha, numeroDocumento});
				}
			});
			resolve(linhaDigitavel);
		});
	};
	
	GeradorDeBoleto.prototype.gerarHTML = function() {
		throw new Error('Não implementado!');
	};

	return GeradorDeBoleto;
})();

module.exports = GeradorDeBoleto;
