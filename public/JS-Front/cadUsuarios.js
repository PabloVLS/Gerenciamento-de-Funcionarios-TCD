document.querySelector('.form-usuario').addEventListener('submit', async function (e) {
    e.preventDefault(); 
    const cargoUsuario = localStorage.getItem('usuarioCargo');
    if (cargoUsuario !== 'Gerente') {
      Swal.fire({
        icon: 'error',title: 'Acesso negado',text: 'Você não tem permissão para cadastrar usuário!'
      });
      return;
    }
    const nome = document.getElementById('nome').value;
    const cargo = document.getElementById('cargo').value;
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const email = document.getElementById('email').value;

    if(senha != confirmarSenha){
      Swal.fire({
        icon: 'warning',title: 'Senhas diferentes',text: 'As senhas não coincidem!'
      });
      return;
    }

    try {
      const resposta = await fetch('http://localhost:3000/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          cargo,
          usuario,
          senha,
          confirmarSenha,
          email
        })
      });

      const resultado = await resposta.json();
      // console.log('Usuário cadastrado:', resultado);
      Swal.fire({
        icon: 'success',title: 'Sucesso!',text: 'Usuário cadastrado com sucesso!'
      });
    } catch (erro) {
      console.error('Erro ao cadastrar:', erro);
      Swal.fire({
        icon: 'error',title: 'Erro',text: 'Erro ao cadastrar usuário.'
      });
    }
  });