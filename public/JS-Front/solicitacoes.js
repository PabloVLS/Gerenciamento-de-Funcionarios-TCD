window.addEventListener('DOMContentLoaded', async () => {
    const tabela = document.querySelector('#tabela-solicitacoes tbody');
    const cargoUsuario = localStorage.getItem('usuarioCargo');

    try {
      const resposta = await fetch('http://localhost:3000/api/funcionarios');
      const funcionarios = await resposta.json();
  
      funcionarios.forEach(f => {
        const linha = document.createElement('tr');
  
        linha.innerHTML = `
          <td>${f.nome}</td>
          <td>${f.cargo}</td>
          <td>${f.loja}</td>
          <td><input type="checkbox" class="checkbox" ${f.celular ? 'checked' : ''}/></td>
          <td><input type="checkbox" class="checkbox" ${f.notebook ? 'checked' : ''}/></td>
          <td><input type="checkbox" class="checkbox" ${f.chip ? 'checked' : ''}/></td>
          <td class="obs-icon">📝${f.observacoes}</td>
          <td class="acoes">
            <button class="btn-aprovar" title="Aprovar Solicitação">✔️</button>
            <button class="btn-recusar" title="Recusar Solicitação">✖️</button>
          </td>
          <td class="financeiro">
            <button class="btn-aprovar" title="Financeiro Aprovou">✔️</button>
            <button class="btn-recusar" title="Financeiro Recusou">✖️</button>
          </td>
          <td class="coluna-extra" style="display: none;"></td>
        `;
  
        tabela.appendChild(linha);
  
        const btnAprovarAcao = linha.querySelector('.acoes .btn-aprovar');
        const btnRecusarAcao = linha.querySelector('.acoes .btn-recusar');
        const btnAprovarFin = linha.querySelector('.financeiro .btn-aprovar');
        const btnRecusarFin = linha.querySelector('.financeiro .btn-recusar');
  
        const checkboxCelular = linha.querySelector('td:nth-child(4) input[type="checkbox"]');
        const checkboxNotebook = linha.querySelector('td:nth-child(5) input[type="checkbox"]');
        const checkboxChip = linha.querySelector('td:nth-child(6) input[type="checkbox"]');
  
        const colunaExtra = linha.querySelector('.coluna-extra');
  
        let acaoAprovada = false;
        let financeiroAprovado = false;
  
        function verificarCondicoes() {
          if (acaoAprovada && financeiroAprovado) {
            let campos = '';
  
            if (checkboxCelular.checked) {
              campos += `
                <div class="inputGroup">
                  <strong>Modelo Celular:</strong>
                  <input type="text" class="input-celular" required />
                </div>
              `;
            }
  
            if (checkboxNotebook.checked) {
              campos += `
                <div class="inputGroup">
                  <strong>Modelo Notebook:</strong>
                  <input type="text" class="input-notebook" required />
                </div>
              `;
            }
  
            if (checkboxChip.checked) {
              campos += `
                <div class="inputGroup">
                  <strong>Modelo Chip:</strong>
                  <input type="text" class="input-chip" required />
                </div>
              `;
            }
  
            colunaExtra.innerHTML = campos + `
              <button class="btn-finalizar" title="Clique para finalizar a solicitação">Finalizar</button>
            `;
            colunaExtra.style.display = 'table-cell';

            //Logica pra quando clicar em finalizar no solicitações
            const btnFinalizar = linha.querySelector('.btn-finalizar');

            btnFinalizar.addEventListener('click', () => {
              const modal = document.querySelector('#modal-confirmacao');
              const errosValidacao = document.querySelector('#erros-validacao');
              const btnConfirmar = document.querySelector('#btn-confirmar-finalizacao');
              const btnCancelar = document.querySelector('#btn-cancelar-finalizacao');
            
              modal.style.display ='flex'; // Exibe o modal de confirmação
              errosValidacao.innerHTML = '';
               // coleta os valores atuais dos campos de entrada (caso já estejam preenchidos)
              const inputCelular = linha.querySelector('.input-celular')?.value || '';
              const inputNotebook = linha.querySelector('.input-notebook')?.value || '';
              const inputChip = linha.querySelector('.input-chip')?.value || '';
            
              let erros = [];
              //se o checkbox estiver marcado, mas o campo correspondente estiver vazio, gera aviso
              if (checkboxCelular.checked && inputCelular.trim() === '') {
                erros.push('Campo de celular está vazio.');
              }
              if (checkboxNotebook.checked && inputNotebook.trim() === '') {
                erros.push('Campo de notebook está vazio.');
              }
              if (checkboxChip.checked && inputChip.trim() === '') {
                erros.push('Campo de chip está vazio.');
              }
            
              if (erros.length > 0) {
                errosValidacao.innerHTML = erros.map(e => `<p style="color:red;">${e}</p>`).join('');
              }
            
              btnCancelar.onclick = () => {
                modal.style.display = 'none';
              };
              // revisa os campos dnv e envia os dados
              btnConfirmar.onclick = async () => {
                const inputCelularAtual = linha.querySelector('.input-celular')?.value || '';
                const inputNotebookAtual = linha.querySelector('.input-notebook')?.value || '';
                const inputChipAtual = linha.querySelector('.input-chip')?.value || '';
              
                let errosAtualizados = [];
              
                if (checkboxCelular.checked && inputCelularAtual.trim() === '') {
                  errosAtualizados.push('Campo de celular está vazio.');
                }
                if (checkboxNotebook.checked && inputNotebookAtual.trim() === '') {
                  errosAtualizados.push('Campo de notebook está vazio.');
                }
                if (checkboxChip.checked && inputChipAtual.trim() === '') {
                  errosAtualizados.push('Campo de chip está vazio.');
                }
              
                if (errosAtualizados.length > 0) {
                  errosValidacao.innerHTML = errosAtualizados.map(e => `<p style="color:red;">${e}</p>`).join('');
                }
                // Desativa o botão temporariamente para evitar múltiplos envios
                btnConfirmar.disabled = true;
                btnConfirmar.innerText = 'Finalizando...';
              
                // Monta o objeto com os dados a serem enviados
                const dadosFinalizacao = {
                  id_funcionario: f.id,
                  nome: f.nome,
                  cargo: f.cargo,
                  loja: f.loja,
                  modelo_celular: inputCelularAtual || null,
                  modelo_notebook: inputNotebookAtual || null,
                  modelo_chip: inputChipAtual || null,
                };
              
                try {
                  const resp = await fetch('http://localhost:3000/api/controle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosFinalizacao)
                  });
              
                  const result = await resp.json();
              
                  // Remove a linha da tabela e fecha o modal
                  if (result.sucesso) {
                    // Atualiza a solicitação original para marcá-la como finalizada
                    console.log("Finalizando solicitação ID:", f.id);
                    await fetch(`http://localhost:3000/api/solicitacoes/finalizar/${f.id}`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(dadosFinalizacao)
                    });
                    tabela.removeChild(linha);
                    modal.style.display = 'none';
                    alert('Solicitação finalizada e registrada no controle!');
                  } else {
                    alert('Erro: ' + (result.mensagem || 'Erro ao salvar no controle.'));
                  }
                } catch (erro) {
                  console.error('Erro ao finalizar:', erro);
                  alert('Erro ao finalizar.');
                } finally {
                  btnConfirmar.disabled = false;
                  btnConfirmar.innerText = 'Confirmar';
                }
              };
              
            });            
            
          } else {
            colunaExtra.style.display = 'none';
          }
        }
  
        btnAprovarAcao.addEventListener('click', () => {
          // Verificação de permissão
          if (cargoUsuario !== 'Gerente') {
            alert('Você não tem permissão.');
            return;
          }
          acaoAprovada = true;
          btnRecusarAcao.style.display = 'none';
          verificarCondicoes();
        });
  
        btnRecusarAcao.addEventListener('click', () => {
          // Verificação de permissão
          if (cargoUsuario !== 'Gerente') {
            alert('Você não tem permissão.');
            return;
          }
          btnAprovarAcao.style.display = 'none';
        });
  
        btnAprovarFin.addEventListener('click', () => {
          // Verificação de permissão
          if (cargoUsuario !== 'Financeiro' && cargoUsuario !== 'Gerente') {
            alert('Você não tem permissão.');
            return;
          }
          financeiroAprovado = true;
          btnRecusarFin.style.display = 'none';
          verificarCondicoes();
        });
  
        btnRecusarFin.addEventListener('click', () => {
          // Verificação de permissão
          if (cargoUsuario !== 'RH' && cargoUsuario !== 'Gerente') {
            alert('Você não tem permissão.');
            return;
          }
          btnAprovarFin.style.display = 'none';
        });
  
        checkboxCelular.addEventListener('change', verificarCondicoes);
        checkboxNotebook.addEventListener('change', verificarCondicoes);
        checkboxChip.addEventListener('change', verificarCondicoes);
      });
    } catch (erro) {
      console.error('Erro ao carregar funcionários:', erro);
    }
  });
  