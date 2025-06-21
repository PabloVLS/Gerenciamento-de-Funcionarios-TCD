document.addEventListener('DOMContentLoaded', () => {
  carregarSolicitacoes();
});
async function carregarSolicitacoes() {
  const listaSolicitacoes = document.getElementById('listaSolicitacoes');
  if (!listaSolicitacoes) return;

  try {
    const resposta = await fetch('http://localhost:3000/api/solicitacoes/pendentes');
    const solicitacoes = await resposta.json();
    console.log(solicitacoes);

    listaSolicitacoes.innerHTML = solicitacoes.map(s => {

      // Flags de aprovação
      const gerenteAprovou = s.aprovado_gerente === true;
      const financeiroAprovou = s.aprovado_financeiro === true;

      // Checar se todos os itens estão preenchidos
      const itensPreenchidos = s.itens.length > 0 && s.itens.some(item => item.status === 'preenchido');

      const tiposSolicitados = s.itens.map(item => item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1));

      const itensHTML = `
        <div class="row">
          ${!itensPreenchidos
          ? `<p><strong>Itens Solicitados:</strong> ${tiposSolicitados.join(', ')}</p>`
          : s.itens.map(item => {
            if (item.status !== 'preenchido') return '';

            if (item.tipo === 'celular' && item.celular) {
              return `
                      <div class="col-md-4">
                        <h6>📱 Celular</h6>
                        <p><strong>Modelo:</strong> ${item.celular.modelo}</p>
                        <p><strong>IMEI:</strong> ${item.celular.imei}</p>
                        <p><strong>Patrimônio:</strong> ${item.celular.numero}</p>
                      </div>
                    `;
            } else if (item.tipo === 'notebook' && item.notebook) {
              return `
                      <div class="col-md-4">
                        <h6>💻 Notebook</h6>
                        <p><strong>Modelo:</strong> ${item.notebook.modelo}</p>
                        <p><strong>Patrimônio:</strong> ${item.notebook.numero_patrimonio}</p>
                        <p><strong>Sistema:</strong> ${item.notebook.sistema_operacional}</p>
                        <p><strong>Preço:</strong> R$ ${item.notebook.preco}</p>
                      </div>
                    `;
            } else if (item.tipo === 'chip' && item.chip) {
              return `
                      <div class="col-md-4">
                        <h6>📶 Chip</h6>
                        <p><strong>Número:</strong> ${item.chip.numero}</p>
                        <p><strong>Operadora:</strong> ${item.chip.operadora}</p>
                        <p><strong>Plano:</strong> ${item.chip.plano}</p>
                      </div>
                    `;
            }

            return '';
          }).join('')
        }
        </div>
      `;


      let botoes = '';

      if (!gerenteAprovou) {
        botoes += `<button class="btn btn-success btn-sm" onclick="aprovarGerente(${s.solicitacao_id})">Aprovar (Gerente)</button>`;
        botoes += `<button class="btn btn-danger btn-sm" onclick="encerrarSolicitacao(${s.solicitacao_id})">Encerrar</button>`;
      } else if (gerenteAprovou && !itensPreenchidos) {
        // Gerente já aprovou, mas ainda não preencheu os itens
        botoes += `<button class="btn btn-warning btn-sm" onclick="abrirModalPreenchimento(${s.solicitacao_id})">Preencher Itens</button>`;
        botoes += `<button class="btn btn-danger btn-sm" onclick="encerrarSolicitacao(${s.solicitacao_id})">Encerrar</button>`;
      } else if (gerenteAprovou && itensPreenchidos && !financeiroAprovou && !s.aprovado_por_financeiro) {
        // Ainda não foi analisado pelo financeiro
        botoes += `<button class="btn btn-primary btn-sm" onclick="aprovarFinanceiro(${s.solicitacao_id})">Aprovar (Financeiro)</button>`;
        botoes += `<button class="btn btn-danger btn-sm" onclick="recusarFinanceiro(${s.solicitacao_id})">Recusar</button>`;
      } else if (gerenteAprovou && itensPreenchidos && s.aprovado_por_financeiro && !financeiroAprovou) {
        // Já foi recusado pelo financeiro
        botoes += `<button class="btn btn-secondary btn-sm" onclick="encerrarSolicitacao(${s.solicitacao_id})">Finalizar Solicitação</button>`;
      } else if (gerenteAprovou && itensPreenchidos && financeiroAprovou) {
        // Gerente aprovou e preencheu os itens, financeiro pode aprovar
        botoes += `<button class="btn btn-secondary btn-sm" onclick="finalizarSolicitacao(${s.solicitacao_id})">Finalizar Solicitação</button>`;
      }



      return `
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">${s.nome_funcionario} - ${s.cargo} (${s.loja})</h5>
            <p><strong>Tipo de Solicitação:</strong> ${s.tipo === 'contratacao' ? 'Contratação' : 'Substituição'}</p>
            <p><strong>Observações:</strong> ${s.observacoes || 'Nenhuma'}</p>
            <p><strong>Criado por:</strong> ${s.nome_criador ? s.nome_criador : 'Informação não disponível'}</p>
            <p><strong>Aprovado pelo gerente:</strong> ${s.aprovado_por_gerente ? s.aprovado_por_gerente : 'Ainda não aprovado'}</p>
            <p><strong>Status Financeiro:</strong> ${
                s.aprovado_financeiro === true
                  ? `Aprovado por ${s.aprovado_por_financeiro}`
                  : s.aprovado_financeiro === false && s.aprovado_por_financeiro
                    ? `Recusado por ${s.aprovado_por_financeiro}`
                    : 'Ainda não aprovado'
              }
            </p>


            <div>
              
              <ul class="mb-3">
                ${itensHTML}
              </ul>
            </div>

            <div class="d-flex flex-wrap gap-2">
              ${botoes}
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Erro ao carregar solicitações:', err);
  }
}


const modalEquipamentos = new bootstrap.Modal(document.getElementById('modalAprovacaoGerente'));
const camposEquipamentos = document.getElementById('camposEquipamentos');
let idSolicitacaoAtual = null;
let itensSolicitadosAtuais = [];
//mostra o modal com os campos dos itens solicitados.
async function abrirModalPreenchimento(solicitacaoId) {
  idSolicitacaoAtual = solicitacaoId;

  try {
    const resposta = await fetch(`http://localhost:3000/api/solicitacoes/${solicitacaoId}/itens`);
    const itens = await resposta.json();
    itensSolicitadosAtuais = itens;

    camposEquipamentos.innerHTML = itens.map(item => {
      if (item.tipo === 'notebook') {
        return `
          <div class="mb-3">
            <h6>Notebook</h6>
            <input type="hidden" name="item_id" value="${item.id}">
            <input class="form-control mb-2" name="modelo_notebook_${item.id}" placeholder="Modelo" required>
            <input class="form-control mb-2" name="numero_patrimonio_${item.id}" placeholder="Número Patrimônio">
            <input class="form-control mb-2" name="sistema_operacional_${item.id}" placeholder="Sistema Operacional">
            <input class="form-control" name="valor_notebook_${item.id}" placeholder="Valor (R$)">
          </div>`;
      }
      if (item.tipo === 'celular') {
        return `
          <div class="mb-3">
            <h6>Celular</h6>
            <input type="hidden" name="item_id" value="${item.id}">
            <input class="form-control mb-2" name="modelo_celular_${item.id}" placeholder="Modelo" required>
            <input class="form-control mb-2" name="imei_${item.id}" placeholder="IMEI">
            <input class="form-control mb-2" name="numero_${item.id}" placeholder="Número Patrimõnio">
            <input class="form-control" name="valor_celular_${item.id}" placeholder="Valor (R$)">
          </div>`;
      }
      if (item.tipo === 'chip') {
        return `
          <div class="mb-3">
            <h6>Chip</h6>
            <input type="hidden" name="item_id" value="${item.id}">
            <input class="form-control mb-2" name="numero_chip_${item.id}" placeholder="Número" required>
            <input class="form-control mb-2" name="operadora_chip_${item.id}" placeholder="Operadora">
            <input class="form-control" name="plano_${item.id}" placeholder="Plano">
          </div>`;
      }
      return '';
    }).join('');

    modalEquipamentos.show();
  } catch (err) {
    console.error('Erro ao carregar itens da solicitação:', err);
  }
}



// preenchimento dos itens pelo Gerente
document.getElementById('formEquipamentos').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const dados = [];

  itensSolicitadosAtuais.forEach(item => {
    if (item.tipo === 'notebook') {
      dados.push({
        tipo: 'notebook',
        itemId: item.id,
        modelo: formData.get(`modelo_notebook_${item.id}`),
        numero_patrimonio: formData.get(`numero_patrimonio_${item.id}`),
        sistema_operacional: formData.get(`sistema_operacional_${item.id}`),
        preco: formData.get(`valor_notebook_${item.id}`),
        preenchido_por: nomeUsuarioAtual
      });
    }
    if (item.tipo === 'celular') {
      dados.push({
        tipo: 'celular',
        itemId: item.id,
        modelo: formData.get(`modelo_celular_${item.id}`),
        imei: formData.get(`imei_${item.id}`),
        numero: formData.get(`numero_${item.id}`),
        operadora: formData.get(`operadora_${item.id}`),
        preco: formData.get(`valor_celular_${item.id}`),
        preenchido_por: nomeUsuarioAtual
      });
    }
    if (item.tipo === 'chip') {
      dados.push({
        tipo: 'chip',
        itemId: item.id,
        numero: formData.get(`numero_chip_${item.id}`),
        operadora: formData.get(`operadora_chip_${item.id}`),
        plano: formData.get(`plano_${item.id}`),
        preenchido_por: nomeUsuarioAtual
      });
    }
  });

  try {
    // pra cada item preenchido ele salva no banco
    for (const item of dados) {
      const resposta = await fetch(`http://localhost:3000/api/solicitacoes/itens/${item.itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      if (!resposta.ok) {
        throw new Error(`Erro ao salvar item ${item.itemId}`);
      }
    }

    await Swal.fire({
      icon: 'success',
      title: 'Sucesso!',
      text: 'Todos os equipamentos foram preenchidos com sucesso!',
      confirmButtonColor: '#3085d6',
    });
    modalEquipamentos.hide();
    carregarSolicitacoes();
  } catch (erro) {
    console.error(erro);
    Swal.fire({
      icon: 'error',
      title: 'Erro!',
      text: 'Erro ao salvar os equipamentos.',
      confirmButtonColor: '#d33',
    });
  }
});







function temPermissao(permissoes = []) {
  const cargo = localStorage.getItem('usuarioCargo');
  return permissoes.includes(cargo);
}




async function aprovarGerente(solicitacaoId) {
  if (!temPermissao(['Gerente'])) {
    await Swal.fire({
      icon: 'error',
      title: 'Acesso negado',
      text: 'Você não tem permissão para aprovar como gerente.',
    });
    return;
  }

  const nomeGerente = localStorage.getItem('usuarioNome');
  if (!nomeGerente) return;

  try {
    const resposta = await fetch(`http://localhost:3000/api/solicitacoes/${solicitacaoId}/aprovar-gerente`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome_gerente: nomeGerente })
    });

    if (!resposta.ok) throw new Error('Erro na aprovação');

    await Swal.fire('Aprovado!', 'Solicitação aprovada.', 'success');
    carregarSolicitacoes();
  } catch (erro) {
    console.error(erro);
    await Swal.fire('Erro', 'Erro ao aprovar como gerente.', 'error');
  }
}

async function aprovarFinanceiro(solicitacaoId) {
  if (!temPermissao(['Financeiro'])) {
    await Swal.fire({
      icon: 'error',
      title: 'Acesso negado',
      text: 'Você não tem permissão para aprovar como financeiro.',
    });
    return;
  }

  const nomeFinanceiro = localStorage.getItem('usuarioNome');
  if (!nomeFinanceiro) return;

  try {
    const resposta = await fetch(`http://localhost:3000/api/solicitacoes/${solicitacaoId}/aprovar-financeiro`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome_financeiro: nomeFinanceiro })
    });

    if (!resposta.ok) throw new Error('Erro na aprovação');

    await Swal.fire('Aprovado!', 'Solicitação aprovada pelo financeiro.', 'success');
    carregarSolicitacoes();
  } catch (erro) {
    console.error(erro);
    await Swal.fire('Erro', 'Erro ao aprovar como financeiro.', 'error');
  }
}

async function recusarFinanceiro(solicitacaoId) {/*mudei aqui */
  if (!temPermissao(['Financeiro'])) {
    await Swal.fire({
      icon: 'error',
      title: 'Acesso negado',
      text: 'Você não tem permissão para recusar como financeiro.',
    });
    return;
  }

  const nomeFinanceiro = localStorage.getItem('usuarioNome');
  if (!nomeFinanceiro) return;

  try {
    const resposta = await fetch(`http://localhost:3000/api/solicitacoes/${solicitacaoId}/recusar-financeiro`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome_financeiro: nomeFinanceiro })
    });

    if (!resposta.ok) throw new Error('Erro na recusa');

    await Swal.fire('Recusado!', 'Solicitação recusada pelo financeiro.', 'info');
    carregarSolicitacoes();
  } catch (erro) {
    console.error(erro);
    await Swal.fire('Erro', 'Erro ao recusar como financeiro.', 'error');
  }
}



async function finalizarSolicitacao(id) {
  if (!temPermissao(['Gerente'])) {
    await Swal.fire({
      icon: 'error',
      title: 'Acesso negado',
      text: 'Você não tem permissão para finalizar a solicitação.',
    });
    return;
  }

  const confirmar = await Swal.fire({
    title: 'Finalizar Solicitação?',
    text: 'Todos os itens devem estar preenchidos.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Finalizar',
    cancelButtonText: 'Cancelar'
  });

  if (!confirmar.isConfirmed) return;

  try {
    const resposta = await fetch(`/api/solicitacoes/${id}/finalizar`, {
      method: 'PUT'
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      await Swal.fire('Erro', erro.erro || 'Erro ao finalizar', 'error');
      return;
    }

    const data = await resposta.json();
    await Swal.fire('Sucesso', data.mensagem, 'success');
    carregarSolicitacoes();

  } catch (erro) {
    console.error(erro);
    await Swal.fire('Erro', 'Erro ao finalizar a solicitação.', 'error');
  }
}

async function encerrarSolicitacao(id) {
  if (!temPermissao(['Gerente'])) {
    await Swal.fire({
      icon: 'error',
      title: 'Acesso negado',
      text: 'Você não tem permissão para encerrar a solicitação.',
    });
    return;
  }

  const confirmar = await Swal.fire({
    title: 'Encerrar Solicitação?',
    text: 'Tem certeza que deseja encerrar esta solicitação?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, encerrar',
    cancelButtonText: 'Cancelar'
  });

  if (!confirmar.isConfirmed) return;

  try {
    const resposta = await fetch(`/api/solicitacoes/${id}/encerrar`, {
      method: 'PATCH'
    });

    if (!resposta.ok) throw new Error('Erro ao encerrar');

    const data = await resposta.json();
    await Swal.fire('Encerrada', data.mensagem, 'success');
    carregarSolicitacoes();

  } catch (erro) {
    console.error(erro);
    await Swal.fire('Erro', 'Erro ao encerrar a solicitação.', 'error');
  }
}






async function salvarItensPreenchidos() {
  const form = document.getElementById('formEquipamentos');
  const formData = new FormData(form);
  const dados = {};

  // Agrupar os dados por ID
  for (const [chave, valor] of formData.entries()) {
    const match = chave.match(/^(.+)_([0-9]+)$/); // Ex: modelo_notebook_4
    if (match) {
      const campo = match[1]; // modelo_notebook, numero_chip, etc.
      const id = match[2];

      if (!dados[id]) dados[id] = {};
      dados[id][campo] = valor.trim();
    }
  }

  try {
    console.log("Dados agrupados por itemId:", dados);
    for (const itemId in dados) {
      const campos = dados[itemId];

      let tipo = '';
      if (Object.keys(campos).some(c => c.includes('notebook'))) {
        tipo = 'notebook';
      } else if (Object.keys(campos).some(c => c.includes('celular'))) {
        tipo = 'celular';
      } else if (Object.keys(campos).some(c => c.includes('chip'))) {
        tipo = 'chip';
      } else {
        console.warn(`Tipo não identificado para o item ${itemId}`);
        continue;
      }

      const payload = {
        ...campos,
        tipo,
        preenchido_por: 'Cassio' // ou usuário logado
      };
      console.log(`Enviando dados para itemId ${itemId}:`, payload);
      const resposta = await fetch(`http://localhost:3000/api/solicitacoes/itens/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) {
        throw new Error(`Erro ao salvar item ${itemId}`);
      }
    }

    await Swal.fire('Preenchido!', 'Itens preenchidos com sucesso.', 'success');
    modalEquipamentos.hide();
    carregarSolicitacoes();

  } catch (erro) {
    console.error('Erro ao salvar os itens:', erro);
    await Swal.fire('Erro!', 'Erro ao preencher os itens.', 'error');
  }
}








// async function carregarSolicitacoes() {
//   const listaSolicitacoes = document.getElementById('listaSolicitacoes');
//   if (!listaSolicitacoes) return;

//   try {
//     const resposta = await fetch('http://localhost:3000/api/solicitacoes/pendentes');
//     const solicitacoes = await resposta.json();

//     listaSolicitacoes.innerHTML = solicitacoes.map(s => {
//       console.log(s);
//       return `
//     <div class="card mb-4">
//       <div class="card-body">
//         <h5 class="card-title">${s.nome_funcionario} - ${s.cargo} (${s.loja})</h5>
//         <p><strong>Tipo de Solicitação:</strong> ${s.tipo === 'contratacao' ? 'Contratação' : 'Substituição'}</p>
//         <p><strong>Observações:</strong> ${s.observacoes || 'Nenhuma'}</p>

//         <div>
//           <strong>Itens Solicitados:</strong>
//           <ul class="mb-3">
//             ${s.itens.map(item => `
//               <li>${item.tipo} - <span class="text-muted">a preencher</span></li>
//             `).join('')}
//           </ul>
//         </div>

//         <div class="d-flex flex-wrap gap-2">
//           <button class="btn btn-success btn-sm" onclick="abrirModalAprovacao(${s.solicitacao_id})">Aprovar (Gerente)</button>
//           <button class="btn btn-primary btn-sm">Aprovar (Financeiro)</button>
//           <button class="btn btn-danger btn-sm">Encerrar</button>
//         </div>
//       </div>
//     </div>
//   `;
//     }).join('');


//   } catch (err) {
//     console.error('Erro ao carregar solicitações:', err);
//   }
// }






// async function aprovarGerente(solicitacaoId) {
//   const nomeGerente = "Cassio";
//   //console.log("no aprovar gerente o id e:" + solicitacaoId)
//   if (!nomeGerente) return;

//   try {
//     const resposta = await fetch(`http://localhost:3000/api/solicitacoes/${solicitacaoId}/aprovar-gerente`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ nome_gerente: nomeGerente })
//     });

//     if (!resposta.ok) throw new Error('Erro na aprovação');

//     Swal.fire('Aprovado!', 'Solicitação aprovada pelo gerente.', 'success');
//     carregarSolicitacoes(); // recarrega a lista atualizada
//   } catch (erro) {
//     console.error(erro);
//     Swal.fire('Erro', 'Erro ao aprovar como gerente.', 'error');
//   }
// }




// async function aprovarFinanceiro(solicitacaoId) {
//   const nomeFinanceiro = "Marcela";

//   if (!nomeFinanceiro) return;

//   try {
//     const resposta = await fetch(`http://localhost:3000/api/solicitacoes/${solicitacaoId}/aprovar-financeiro`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ nome_financeiro: nomeFinanceiro })
//     });

//     if (!resposta.ok) throw new Error('Erro na aprovação');

//     Swal.fire('Aprovado!', 'Solicitação aprovada pelo financeiro.', 'success');
//     carregarSolicitacoes();
//   } catch (erro) {
//     console.error(erro);
//     Swal.fire('Erro', 'Erro ao aprovar como financeiro.', 'error');
//   }
// }


// async function finalizarSolicitacao(id) {
//   const confirmar = confirm("Finalizar a solicitação? Todos os itens devem estar preenchidos.");
//   if (!confirmar) return;

//   try {
//     const resposta = await fetch(`/api/solicitacoes/${id}/finalizar`, {
//       method: 'PUT'
//     });

//     if (!resposta.ok) {
//       const erro = await resposta.json();
//       Swal.fire('Erro', erro.erro || 'Erro ao finalizar', 'error');
//       return;
//     }

//     const data = await resposta.json();
//     Swal.fire('Sucesso', data.mensagem, 'success');
//     carregarSolicitacoes();

//   } catch (erro) {
//     console.error(erro);
//     Swal.fire('Erro', 'Erro ao finalizar a solicitação.', 'error');
//   }
// }


// async function encerrarSolicitacao(id) {
//   if (!temPermissao(['Gerente'])) {
//     alert('Você não tem permissão.');
//     return;
//   }
//   const confirmar = confirm("Tem certeza que deseja encerrar esta solicitação?");
//   if (!confirmar) return;

//   try {
//     const resposta = await fetch(`/api/solicitacoes/${id}/encerrar`, {
//       method: 'PATCH'
//     });

//     if (!resposta.ok) throw new Error('Erro ao encerrar');

//     const data = await resposta.json();
//     Swal.fire('Encerrada', data.mensagem, 'success');
//     carregarSolicitacoes();

//   } catch (erro) {
//     console.error(erro);
//     Swal.fire('Erro', 'Erro ao encerrar a solicitação.', 'error');
//   }
// }

// document.getElementById('formEquipamentos').addEventListener('submit', async (e) => {
//   e.preventDefault();

//   const formData = new FormData(e.target);
//   const dados = [];

//   itensSolicitadosAtuais.forEach(item => {
//     if (item.tipo === 'notebook') {
//       dados.push({
//         tipo: 'notebook',
//         item_solicitado_id: item.id,
//         modelo: formData.get(`modelo_notebook_${item.id}`),
//         numero_patrimonio: formData.get(`numero_patrimonio_${item.id}`),
//         sistema_operacional: formData.get(`sistema_operacional_${item.id}`),
//         valor: formData.get(`valor_notebook_${item.id}`)
//       });
//     }
//     if (item.tipo === 'celular') {
//       dados.push({
//         tipo: 'celular',
//         item_solicitado_id: item.id,
//         modelo: formData.get(`modelo_celular_${item.id}`),
//         imei: formData.get(`imei_${item.id}`),
//         numero: formData.get(`numero_${item.id}`),
//         operadora: formData.get(`operadora_${item.id}`),
//         valor: formData.get(`valor_celular_${item.id}`)
//       });
//     }
//     if (item.tipo === 'chip') {
//       dados.push({
//         tipo: 'chip',
//         item_solicitado_id: item.id,
//         numero: formData.get(`numero_chip_${item.id}`),
//         operadora: formData.get(`operadora_chip_${item.id}`),
//         plano: formData.get(`plano_${item.id}`)
//       });
//     }
//   });

//   try {
//     const resposta = await fetch(`http://localhost:3000/api/solicitacoes/${idSolicitacaoAtual}/aprovar-gerente`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ equipamentos: dados })
//     });

//     if (resposta.ok) {
//       alert('Equipamentos salvos com sucesso!');
//       modalEquipamentos.hide();
//       carregarSolicitacoes();
//     } else {
//       alert('Erro ao salvar os equipamentos.');
//     }
//   } catch (erro) {
//     console.error(erro);
//     alert('Erro na comunicação com o servidor.');
//   }
// });