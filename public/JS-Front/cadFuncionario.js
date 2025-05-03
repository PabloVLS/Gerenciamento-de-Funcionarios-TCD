document.querySelector('.form-funcionario').addEventListener('submit', async function (e) {
    e.preventDefault(); 

    const cargoUsuario = localStorage.getItem('usuarioCargo');

    // Verificação de permissão
    if (cargoUsuario !== 'RH' && cargoUsuario !== 'Gerente') {
      alert('Você não tem permissão para cadastrar funcionários.');
      return;
    }

    const nome = document.getElementById('nome').value;
    const cargo = document.getElementById('cargo').value;
    const loja = document.getElementById('loja').value;

    const equipamentos = document.querySelectorAll('input[name="equipamentos"]:checked');
    const observacoes = document.getElementById('observacoes').value;
    let equipamentosArray = [];
    equipamentos.forEach(eq => {
      equipamentosArray.push(eq.value);
    });

    try {
      const resposta = await fetch('http://localhost:3000/api/funcionarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          cargo,
          loja,
          equipamentos: equipamentosArray,
          observacoes
        })
      });

      const resultado = await resposta.json();
      console.log('Usuário cadastrado:', resultado);
      alert('Usuário cadastrado com sucesso!');
    } catch (erro) {
      console.error('Erro ao cadastrar:', erro);
      alert('Erro ao cadastrar funcionário.');
    }
  });