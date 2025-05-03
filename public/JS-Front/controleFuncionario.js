// Abre o dropdown opções...
function toggleDropdown(button) {
    const dropdown = button.nextElementSibling;
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  }
  
  // Fecha dropdown se clicar fora
  window.addEventListener("click", function (event) {
    if (!event.target.matches('.btn-opcoes')) {
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.style.display = 'none';
      });
    }
  });
  
  document.querySelectorAll('.btn-demitir').forEach((botao, index) => {
    botao.addEventListener('click', function () {
      const linha = botao.closest('tr');
      linha.children[0].textContent = 'Desligado';
      linha.children[1].textContent = '—';
      linha.children[5].textContent = new Date().toLocaleDateString(); 
    });
  });
  
  document.addEventListener('DOMContentLoaded', async ()=>{
    const tbody = document.querySelector('tbody');

    try{
      const resposta = await fetch('http://localhost:3000/api/controle');
      const dados = await resposta.json();

      dados.forEach(func =>{
        console.log(func);
        const linha = document.createElement('tr');
        linha.innerHTML = `
        <td>${func.nome}</td>
        <td>${func.cargo}</td>
        <td>${func.loja}</td>
        <td>${func.modelo_celular || '-'}</td>
        <td>${func.modelo_notebook || '-'}</td>
        <td>${func.modelo_chip || '-'}</td>
        <td>${new Date(func.data_finalizacao).toLocaleDateString()}</td>
        <td>
          <div class="menu-container">
            <button class="btn-opcoes" onclick="toggleDropdown(this)">⋯</button>
            <div class="dropdown-menu">
              <button class="btn-demitir">Demitir</button>
            </div>
          </div>
        </td>
      `;
      tbody.appendChild(linha);
      });
    }catch(erro){
      console.error('Erro ao gerar lista de controle: ',erro)
    }
  });