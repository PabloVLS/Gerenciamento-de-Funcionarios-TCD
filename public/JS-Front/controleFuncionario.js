// Toggle dropdown menu
function toggleDropdown(button) {
  const dropdown = button.nextElementSibling;
  const isOpen = dropdown.classList.contains('show');
  closeAllDropdowns();
  if (!isOpen) {
    dropdown.classList.add('show');
  }
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
    menu.classList.remove('show');
  });
}

// Fecha dropdown se clicar fora
window.addEventListener('click', (e) => {
  if (!e.target.closest('.btn-opcoes')) {
    closeAllDropdowns();
  }
});

// Toast feedback usando Bootstrap 5
function mostrarToast(mensagem) {
  const toastEl = document.getElementById('toastSucesso');
  if (toastEl) {
    toastEl.querySelector('.toast-body').textContent = mensagem;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  } else {
    console.warn("Toast de sucesso não encontrado no DOM.");
  }
}


// Modal edição funcionário | Abrir Modal
async function abrirModal(func) {
  let idFuncionario = func.id;
  try {
    // Busca dados atualizados do funcionário no backend
    const resposta = await fetch(`http://localhost:3000/api/funcionarios/${idFuncionario}`);
    if (!resposta.ok) throw new Error('Erro ao buscar dados do funcionário');

    const func = await resposta.json();

    const modalElement = document.getElementById('modalEdicao');
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEdicao'));
    modal.show();

    document.getElementById('editId').value = func.id || '';
    document.getElementById('editNome').value = func.nome || '';
    document.getElementById('editCargo').value = func.cargo || '';
    document.getElementById('editLoja').value = func.loja || '';
    document.getElementById('editCPF').value = func.cpf || '';
    document.getElementById('editObservacoes').value = func.observacoes || '';
    document.getElementById('editStatus').value = func.status || '';
    document.getElementById('previewFotoFunc').src = func.foto_funcionario ? `/uploads/${func.foto_funcionario}` : '/uploads/padrao.png';
    document.getElementById('previewFotoCPF').src = func.foto_cpf ? `/uploads/${func.foto_cpf}` : 'caminho/para/imagem-padrao.png';

    // Atualiza o botão de demissão com o ID do funcionário ??????????????????????????????????
    const btnDemitir = document.getElementById('btnAbrirModalDemissao');
    if (btnDemitir) {
      btnDemitir.onclick = () => abrirModalDemissao(func.id);
    } else {
      console.warn("Botão de demissão não encontrado no DOM.");
    }
  } catch (erro) {
    console.error(erro);
    alert('Erro ao carregar dados do funcionário');
  }
}

// Envio do formulário de edição (modal)
const formEditar = document.getElementById('form-edicao');
formEditar.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btnSalvar = formEditar.querySelector('button[type="submit"]');
  btnSalvar.disabled = true;
  btnSalvar.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...`;

  const formData = new FormData(formEditar);
  const id = formData.get('id');

  try {
    const resposta = await fetch(`http://localhost:3000/api/funcionarios/editar/${id}`, {
      method: 'PUT',
      body: formData
    });

    if (resposta.ok) {
      const dadosAtualizados = await resposta.json();
      mostrarToast('Funcionário atualizado com sucesso!');

      // Atualiza linha da tabela sem reload
      const linha = document.querySelector(`tr[data-id='${id}']`);
      if (linha) {
        linha.children[0].textContent = dadosAtualizados.nome;
        linha.children[1].textContent = dadosAtualizados.cargo;
        linha.children[2].textContent = dadosAtualizados.cpf;
        linha.children[3].textContent = dadosAtualizados.loja;
        linha.children[4].textContent = dadosAtualizados.observacoes;
        linha.children[6].textContent = dadosAtualizados.status;
        const img = linha.querySelector('img');
        if (img && dadosAtualizados.foto_funcionario) {
          img.src = `/uploads/${dadosAtualizados.foto_funcionario}`;
        }

      }

      // Fecha modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalEdicao'));
      modal.hide();
    } else {
      mostrarToast('Erro ao atualizar funcionário.', 'danger');
    }
  } catch (erro) {
    console.error('Erro ao atualizar:', erro);
    mostrarToast('Erro inesperado ao salvar.', 'danger');
  } finally {
    btnSalvar.disabled = false;
    btnSalvar.textContent = 'Salvar Alterações';
  }
});

const modalEdicao = document.getElementById('modalEdicao');
modalEdicao.addEventListener('hidden.bs.modal', () => {
  // limpa os inputs de imagem (evita imagens presas)
  document.getElementById('editFotoFunc').value = '';
  document.getElementById('editFotoCPF').value = '';
});
// Preview da nova foto do FUNCIONÁRIO
document.getElementById('editFotoFunc').addEventListener('change', (e) => {
  const arquivo = e.target.files[0];
  if (arquivo) {
    const preview = document.getElementById('previewFotoFunc');
    preview.src = URL.createObjectURL(arquivo);
  }
});

// Preview da nova foto do CPF
document.getElementById('editFotoCPF').addEventListener('change', (e) => {
  const arquivo = e.target.files[0];
  if (arquivo) {
    const preview = document.getElementById('previewFotoCPF');
    preview.src = URL.createObjectURL(arquivo);
  }
});






// Abrir modal de confirmação de Demissao

let idFuncionarioParaDemitir = null;

// Abrir modal de confirmação de Demissão
function abrirModalDemissao(idFuncionario) {
  idFuncionarioParaDemitir = idFuncionario;
  console.log("id do funcionario pra demitir é:" + idFuncionario);
  const modal = new bootstrap.Modal(document.getElementById('modalConfirmarDemissao'));
  modal.show();
}

// Confirmar Demissão (botão do modal)
document.getElementById('btnConfirmarDemissao').addEventListener('click', async () => {
  if (!idFuncionarioParaDemitir) return;

  try {
    // Chama o endpoint para demitir o funcionário (PUT)
    const resposta = await fetch(`http://localhost:3000/api/funcionarios/demitir/${idFuncionarioParaDemitir}`, {
      method: 'PUT'
    });

    if (resposta.ok) {
      mostrarToast('Funcionário desligado com sucesso!', 'success');

      // Atualiza visualmente o status e estilização da linha na tabela
      const linha = document.querySelector(`tr[data-id='${idFuncionarioParaDemitir}']`);
      if (linha) {
        const statusCelula = linha.querySelector('td:nth-child(7)');
        if (statusCelula) statusCelula.textContent = 'Desligado';
        linha.classList.add('linha-desligado');
      }

      // Fecha o modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarDemissao'));
      modal.hide();

      idFuncionarioParaDemitir = null;
    } else {
      mostrarToast('Erro ao desligar o funcionário.', 'danger');
    }
  } catch (erro) {
    console.error('Erro ao desligar:', erro);
    mostrarToast('Erro inesperado ao desligar funcionário.', 'danger');
  }
});



// Função para abrir modal de Solicitação contratação
const modalContratacao = new bootstrap.Modal(document.getElementById('modalContratacao'));

function abrirSolicitacaoNovoFuncionario(funcionarioId, nomeFuncionario) {
  const form = document.getElementById('formContratacao');
  form.reset();
  document.getElementById('nomeFuncionarioContratacao').textContent = `Funcionário: ${nomeFuncionario}`;
  document.getElementById('funcionarioIdContratacao').value = funcionarioId;
  modalContratacao.show();
}
//Logica pra solicitação de novo funcionario
document.getElementById('formContratacao').addEventListener('submit', async function (e) {
  e.preventDefault();

  const funcionarioId = document.getElementById('funcionarioIdContratacao').value;
  const observacoes = document.getElementById('observacoesContratacao').value;
  const usuarioId = localStorage.getItem('usuarioId');

  const equipamentosSelecionados = [];
  if (document.getElementById('celularContratacao').checked) equipamentosSelecionados.push('celular');
  if (document.getElementById('notebookContratacao').checked) equipamentosSelecionados.push('notebook');
  if (document.getElementById('chipContratacao').checked) equipamentosSelecionados.push('chip');

  try {
    console.log("usuarioId que abriu solicitação: ",usuarioId)
    const resposta = await fetch('http://localhost:3000/api/solicitacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        funcionario_id: funcionarioId,
        tipo: 'contratacao',
        criado_por: usuarioId,
        observacoes,
        equipamentos: equipamentosSelecionados
      })
    });

    if (!resposta.ok) throw new Error('Erro ao criar solicitação');

    const resultado = await resposta.json();
    alert('Solicitação enviada com sucesso!');
    modalContratacao.hide();

  } catch (erro) {
    console.error(erro);
    alert('Erro ao enviar solicitação.');
  }
});



// Função para abrir modal de substituição
const modalSubstituicao = new bootstrap.Modal(document.getElementById('modalSubstituicao'));

function abrirSolicitacaoTroca(funcionarioId, nomeFuncionario) {
  const form = document.getElementById('formSubstituicao');
  form.reset();
  document.getElementById('nomeFuncionarioSubstituicao').textContent = `Funcionário: ${nomeFuncionario}`;
  document.getElementById('funcionarioIdSubstituicao').value = funcionarioId;
  modalSubstituicao.show();
}
//Logica pra solicitação de troca
document.getElementById('formSubstituicao').addEventListener('submit', async (event) => {
  event.preventDefault();

  const funcionarioId = document.getElementById('funcionarioIdSubstituicao').value;
  const observacoes = document.getElementById('observacoesSubstituicao').value;
  const usuarioId = localStorage.getItem('usuarioId');
  const equipamentosSelecionados = [];

  if (document.getElementById('celularSubstituicao').checked) equipamentosSelecionados.push('celular');
  if (document.getElementById('notebookSubstituicao').checked) equipamentosSelecionados.push('notebook');
  if (document.getElementById('chipSubstituicao').checked) equipamentosSelecionados.push('chip');

  try {
    console.log("usuarioId que abriu solicitação: ",usuarioId)
    // Envia primeiro para a tabela `solicitacoes`
    const resposta = await fetch('http://localhost:3000/api/solicitacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        funcionario_id: funcionarioId,
        tipo: 'substituicao',
        criado_por: usuarioId,
        observacoes,
        equipamentos: equipamentosSelecionados
      })
    });

    if (!resposta.ok) throw new Error('Erro ao criar solicitação');

    // Fecha o modal e dá feedback
    modalSubstituicao.hide();
    alert('Solicitação enviada com sucesso!');
  } catch (erro) {
    console.error(erro);
    alert('Erro ao enviar solicitação.');
  }
});


// // Demitir funcionário 
// async function demitirFuncionario(id, linha) {
//   try {
//     const resposta = await fetch(`http://localhost:3000/api/funcionarios/demitir/${id}`, {
//       method: 'PUT'
//     });

//     if (resposta.ok) {
//       // Atualiza o status na célula da tabela
//       const statusCelula = linha.querySelector('td:nth-child(7)');
//       if (statusCelula) statusCelula.textContent = 'Desligado';

//       // Estiliza visualmente a linha como "desligado"
//       linha.classList.add('linha-desligado');

//       mostrarToast('Funcionário desligado com sucesso!', 'success');
//     } else {
//       mostrarToast('Erro ao desligar o funcionário.', 'danger');
//     }
//   } catch (erro) {
//     console.error('Erro ao desligar:', erro);
//     mostrarToast('Erro inesperado ao desligar funcionário.', 'danger');
//   }
// }












// Carregar tabela de funcionários
document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.querySelector('tbody');
  tbody.innerHTML = ''; // limpa tabela

  try {
    const resposta = await fetch('http://localhost:3000/api/funcionarios');
    const dados = await resposta.json();

    dados.forEach(func => {
      const linha = document.createElement('tr');
      linha.setAttribute('data-id', func.id);
      console.log("entrou no try do DOM");

      // Verifica permissões com base no usuário logado
      const podeEditar = temPermissao(['RH', 'Gerente']);
      const podeSolicitarTroca = temPermissao(['RH', 'Gerente']);
      const podeSolicitarNovo = temPermissao(['RH', 'Gerente']);
      const podeExcluir = temPermissao(['RH', 'Gerente']);

      // Monta o HTML do menu dinamicamente com base nas permissões
      const opcoesMenu = `
        ${podeEditar ? '<button class="dropdown-item btn-editar">Editar</button>' : ''}
        <a class="dropdown-item" href="#" onclick="abrirModalEquipamentos(${func.id}, '${func.nome}')">Equipamentos</a>
        ${podeSolicitarTroca ? `<a class="dropdown-item" href="#" onclick="abrirSolicitacaoTroca(${func.id}, '${func.nome}')">Solicitação de Troca</a>` : ''}
        ${podeSolicitarNovo ? `<a class="dropdown-item" href="#" onclick="abrirSolicitacaoNovoFuncionario(${func.id}, '${func.nome}')">Solicitação Novo Funcionário</a>` : ''}
        ${podeExcluir ? '<button class="dropdown-item btn-excluir text-danger">Excluir Funcionário</button>' : ''}
      `;

      linha.innerHTML = `
        <td>${func.nome}</td>
        <td>${func.cargo}</td>
        <td>${func.cpf || '-'}</td>
        <td>${func.loja}</td>
        <td>${func.modelo_celular || '-'}</td>
        <td>${func.modelo_notebook || '-'}</td>
        <td>${func.modelo_chip || '-'}</td>
        <td>${func.observacoes || '-'}</td>
        <td><img src="/uploads/${func.foto}" alt="Foto" height="40"></td>
        <td>${func.status || 'ativo'}</td>
        <td>
          <div class="menu-container position-relative">
            <button class="btn-opcoes btn btn-sm btn-secondary" type="button" onclick="toggleDropdown(this)">⋯</button>
            <div class="dropdown-menu" style="position: absolute; right: 0; z-index: 1000;">
              ${opcoesMenu}
            </div>
          </div>
        </td>
      `;

      // Botão editar
      if (podeEditar) {
        const btnEditar = linha.querySelector('.btn-editar');
        btnEditar?.addEventListener('click', () => abrirModal(func));
      }

      // Botão excluir
      if (podeExcluir) {
        const btnExcluir = linha.querySelector('.btn-excluir');
        btnExcluir?.addEventListener('click', () => {
          const status = linha.children[9].textContent.trim().toLowerCase();
          if (status !== 'desligado') {
            mostrarToast('O funcionário precisa estar desligado antes de ser excluído.', 'warning');
            return;
          }
          excluirFuncionario(func.id);
        });
      }

      tbody.appendChild(linha);
    });
  } catch (erro) {
    console.error('Erro ao carregar funcionários:', erro);
    mostrarToast('Erro ao carregar dados.', 'danger');
  }
});

function temPermissao(perfisPermitidos) {
  const cargo = localStorage.getItem('usuarioCargo');
  return cargo && perfisPermitidos.includes(cargo);
}


async function abrirModalEquipamentos(idFuncionario, nomeFuncionario) {
  document.getElementById('nomeFuncionarioEquipamentos').textContent = nomeFuncionario;

  const conteudoDiv = document.getElementById('conteudoEquipamentos');
  conteudoDiv.innerHTML = `
    <div class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>
  `;

  const modal = new bootstrap.Modal(document.getElementById('modalEquipamentos'));
  modal.show();

  try {
    const resposta = await fetch(`http://localhost:3000/api/equipamentos/${idFuncionario}`);
    const dados = await resposta.json();

    if (!dados || (!dados.celular && !dados.chip && !dados.notebook)) {
      conteudoDiv.innerHTML = `<p class="text-center text-muted">Nenhum equipamento registrado.</p>`;
      return;
    }

    // Monta o HTML com os dados recebidos
    conteudoDiv.innerHTML = `
      <div class="row g-4">
        ${dados.celular ? `
        <div class="col-md-4">
          <div class="border rounded p-3">
            <h6 class="fw-bold">📱 Celular</h6>
            <p><strong>Modelo:</strong> ${dados.celular.modelo}</p>
            <p><strong>IMEI:</strong> ${dados.celular.imei}</p>
            <p><strong>Número:</strong> ${dados.celular.numero}</p>
            <p><strong>Operadora:</strong> ${dados.celular.operadora}</p>
            <p><strong>Preço:</strong> R$ ${Number(dados.celular.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>` : ''}

        ${dados.chip ? `
        <div class="col-md-4">
          <div class="border rounded p-3">
            <h6 class="fw-bold">💾 Chip</h6>
            <p><strong>Número:</strong> ${dados.chip.numero}</p>
            <p><strong>Operadora:</strong> ${dados.chip.operadora}</p>
            <p><strong>Plano:</strong> ${dados.chip.plano}</p>
          </div>
        </div>` : ''}

        ${dados.notebook ? `
        <div class="col-md-4">
          <div class="border rounded p-3">
            <h6 class="fw-bold">💻 Notebook</h6>
            <p><strong>Modelo:</strong> ${dados.notebook.modelo}</p>
            <p><strong>Patrimônio:</strong> ${dados.notebook.numero_patrimonio}</p>
            <p><strong>Sistema:</strong> ${dados.notebook.sistema_operacional}</p>
            <p><strong>Preço:</strong> R$ ${Number(dados.notebook.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>

          </div>
        </div>` : ''}
      </div>
    `;
  } catch (erro) {
    console.error('Erro ao buscar equipamentos:', erro);
    conteudoDiv.innerHTML = `<p class="text-danger text-center">Erro ao carregar dados dos equipamentos.</p>`;
  }
}



// metodo excluir funcionario (exclui no banco )
async function excluirFuncionario(id) {
  if (!id) return;

  if (!confirm('Tem certeza que deseja excluir este funcionário? Esta ação não poderá ser desfeita.')) {
    return;
  }

  try {
    const resposta = await fetch(`http://localhost:3000/api/funcionarios/${id}`, {
      method: 'DELETE'
    });

    if (resposta.ok) {
      mostrarToast('Funcionário excluído com sucesso!', 'success');

      // Remove a linha da tabela correspondente ao ID
      const linha = document.querySelector(`tr[data-id="${id}"]`);
      if (linha) linha.remove();
    } else {
      mostrarToast('Erro ao excluir funcionário.', 'danger');
    }
  } catch (erro) {
    console.error('Erro ao excluir funcionário:', erro);
    mostrarToast('Erro inesperado ao excluir.', 'danger');
  }
}

document.getElementById("pesquisa").addEventListener("input", function () {
  const termo = this.value.toLowerCase();
  const linhas = document.querySelectorAll("#tabela-funcionarios tr");

  linhas.forEach(linha => {
    const nome = linha.querySelector("td:nth-child(1)").textContent.toLowerCase(); // Nome
    const cpf = linha.querySelector("td:nth-child(3)").textContent.toLowerCase();  // CPF

    const corresponde = nome.includes(termo) || cpf.includes(termo);
    linha.style.display = corresponde ? "" : "none";
  });
});