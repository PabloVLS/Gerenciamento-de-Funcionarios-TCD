document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const formData = new FormData(this);
    const dados = {
      usuarios: formData.get("usuario"),
      senha: formData.get("senha")
    };
  
    const resposta = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });
  
    const resultado = await resposta.json();
  
    if (resultado.sucesso) {
      localStorage.setItem('usuarioCargo', resultado.cargo);
      localStorage.setItem('usuarioNome', resultado.nome);
      window.location.href = "/home";
    } else {
      alert("Usuário inexistente");
    }
  });
  