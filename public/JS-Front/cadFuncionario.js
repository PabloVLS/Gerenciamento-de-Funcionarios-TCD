document.getElementById('form-funcionario').addEventListener('submit', async function (e) {
  e.preventDefault();

  const cargoUsuario = localStorage.getItem('usuarioCargo');

  if (cargoUsuario !== 'RH' && cargoUsuario !== 'Gerente') {
    alert('Você não tem permissão para cadastrar funcionários.');
    return;
  }

  // Pega os campos de texto/seleção
  const nome = document.getElementById('nome').value;
  const cpf = document.getElementById('cpf').value;
  const cargo = document.getElementById('cargo').value;
  const loja = document.getElementById('loja').value;
  const observacoes = document.getElementById('observacoes').value;

  // Pega os arquivos dos inputs file
  const fotoFile = document.getElementById('foto').files[0];
  const cpfUploadFile = document.getElementById('cpf_upload').files[0];

  // Cria o FormData e adiciona os campos
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
      alert('Funcionário cadastrado com sucesso!');
      document.getElementById('form-funcionario').reset();
      document.getElementById('preview-foto').style.display = 'none';
      document.getElementById('preview-cpf').style.display = 'none';

    } else {
      alert('Erro ao cadastrar funcionário. Verifique os dados e tente novamente.');
    }

  } catch (erro) {
    console.error('Erro ao enviar requisição:', erro);
    alert('Erro ao enviar os dados. Tente novamente mais tarde.');
  }
});


// Pré-visualização da imagem da foto do funcionário
document.getElementById('foto').addEventListener('change', function (e) {
  const file = e.target.files[0];
  const preview = document.getElementById('preview-foto');

  if (file && file.type.startsWith('image/')) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
  } else {
    preview.src = '#';
    preview.style.display = 'none';
  }
});

// Pré-visualização do CPF (se for imagem, não mostra PDF)
document.getElementById('cpf_upload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  const preview = document.getElementById('preview-cpf');

  if (file && file.type.startsWith('image/')) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
  } else {
    preview.src = '#';
    preview.style.display = 'none';
  }
});

