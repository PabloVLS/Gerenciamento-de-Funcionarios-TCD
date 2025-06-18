document.getElementById('form-funcionario').addEventListener('submit', async function (e) {
  e.preventDefault();

  const cargoUsuario = localStorage.getItem('usuarioCargo');

  if (cargoUsuario !== 'RH' && cargoUsuario !== 'Gerente') {
    Swal.fire({
      icon: 'error',
      title: 'Acesso negado',
      text: 'Você não tem permissão para cadastrar funcionário!'
    });
    return;
  }

  const nome = document.getElementById('nome').value.trim();
  const cpf = document.getElementById('cpf').value.trim();
  const cargo = document.getElementById('cargo').value;
  const loja = document.getElementById('loja').value;
  const observacoes = document.getElementById('observacoes').value;

  // Validação do nome
  if (!nome) {
    Swal.fire({
      icon: 'error',
      title: 'Nome inválido',
      text: 'O campo nome é obrigatório.'
    });
    return;
  }

  // Validação do CPF
  const cpfLimpo = cpf.replace(/\D/g, ''); // remove tudo que não for número
  if (cpfLimpo.length !== 11 || !/^\d{11}$/.test(cpfLimpo)) { //verificação para garantir que os 11 caracteres são números de 0 a 9
    Swal.fire({
      icon: 'error',
      title: 'CPF inválido',
      text: 'Informe um CPF válido com 11 números.'
    });
    return;
  }

  // Continua pegando os arquivos
  const fotoFile = document.getElementById('foto').files[0];
  const cpfUploadFile = document.getElementById('cpf_upload').files[0];

  // Cria o FormData
  const formData = new FormData();
  formData.append('nome', nome);
  formData.append('cpf', cpf);
  formData.append('cargo', cargo);
  formData.append('loja', loja);
  formData.append('observacoes', observacoes);

  if (fotoFile) {
    formData.append('foto', fotoFile);
  }
  if (cpfUploadFile) {
    formData.append('foto_cpf', cpfUploadFile);
  }

  try {
    const resposta = await fetch('http://localhost:3000/api/funcionarios', {
      method: 'POST',
      body: formData,
    });

    if (resposta.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Funcionário cadastrado com sucesso!'
      });
      document.getElementById('form-funcionario').reset();
      document.getElementById('preview-foto').style.display = 'none';
      document.getElementById('preview-cpf').style.display = 'none';
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao cadastrar funcionário. Verifique os dados e tente novamente.'
      });
    }

  } catch (erro) {
    console.error('Erro ao enviar requisição:', erro);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao enviar os dados. Tente novamente mais tarde.'
    });
  }
});
