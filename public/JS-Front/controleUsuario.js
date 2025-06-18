// Abre o dropdown de opções
function toggleDropdown(button) {
  if (!temPermissao(['Gerente'])) {
    Swal.fire({
      icon: 'warning', title: 'Acesso restrito', text: 'Apenas gerentes podem acessar estas opções.', confirmButtonColor: '#4F46E5'
    });
    return;
  }

  const dropdown = button.nextElementSibling;
  dropdown.classList.toggle("show");
}

function temPermissao(perfisPermitidos) {
  const cargo = localStorage.getItem('usuarioCargo');
  return cargo && perfisPermitidos.includes(cargo);
}


// Fecha dropdown ao clicar fora
window.addEventListener("click", function (event) {
  if (!event.target.matches('.btn-opcoes')) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.style.display = 'none';
    });
  }
});


let usuarioParaExcluir = null;  // guarda a linha e dados do usuário

// Função que abre o modal com o usuário selecionado
function abrirModalExcluir(linha, nomeUsuario, idUsuario) {
  usuarioParaExcluir = { linha, idUsuario };
  const modalBody = document.querySelector('#confirmDeleteModal .modal-body');
  modalBody.textContent = `Tem certeza que deseja excluir o usuário "${nomeUsuario}"?`;

  const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
  modal.show();
}

// Confirmar exclusão no modal
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  if (!usuarioParaExcluir) return;

  try {
    const resposta = await fetch(`http://localhost:3000/api/usuarios/${usuarioParaExcluir.idUsuario}`, {
      method: 'DELETE',
    });

    if (resposta.ok) {
      await Swal.fire({
        icon: 'success',
        title: 'Usuário excluído!',
        text: 'O usuário foi removido com sucesso.',
        confirmButtonColor: '#4F46E5'
      });

      usuarioParaExcluir.linha.remove();
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Erro ao excluir',
        text: 'Não foi possível excluir o usuário.',
        confirmButtonColor: '#DC3545'
      });
    }
  } catch (erro) {
    console.error('Erro ao excluir:', erro);
    alert('Erro ao tentar excluir.');
  }

  // fecha o modal depois da ação
  const modalEl = document.getElementById('confirmDeleteModal');
  const modal = bootstrap.Modal.getInstance(modalEl);
  modal.hide();

  usuarioParaExcluir = null; 
});

//código para preencher tabela fica assim
document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.querySelector('tbody');

  try {
    const resposta = await fetch('http://localhost:3000/api/usuarios');
    const dados = await resposta.json();

    dados.forEach(func => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td>${func.nome}</td>
        <td>${func.cargo}</td>
        <td>${func.email}</td>
        <td>${new Date(func.data_criacao).toLocaleDateString()}</td>
        <td>
          <div class="menu-container" style="position: relative;">
            <button class="btn-opcoes btn btn-secondary btn-sm" onclick="toggleDropdown(this)">⋯</button>
            <div class="dropdown-menu bg-light border p-2">
              <button class="btn-excluir btn btn-danger btn-sm w-100">Excluir</button>
            </div>
          </div>
        </td>
      `;

      linha.querySelector('.btn-excluir').addEventListener('click', () => {
        abrirModalExcluir(linha, func.nome, func.id);
      });

      tbody.appendChild(linha);
    });

  } catch (erro) {
    console.error('Erro ao gerar lista de controle:', erro);
  }
});
