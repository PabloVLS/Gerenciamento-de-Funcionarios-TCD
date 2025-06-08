document.addEventListener("DOMContentLoaded", async () => {
    try {
        console.log("entrou no js Home")
        const resposta = await fetch("/api/home");
        const dados = await resposta.json();

        document.querySelector(".card.blue p").textContent = dados.total;
        document.querySelector(".card.orange p").textContent = dados.aguardando;
        document.querySelector(".card.green p").textContent = dados.finalizados;
        document.querySelector(".card.gray p").textContent = dados.demitidos;

        const lista = document.querySelector(".lista");
        lista.innerHTML = ""; 
        dados.ultimasSolicitacoes.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            lista.appendChild(li);
        });
    } catch (erro) {
        console.error("Erro ao carregar dados da home:", erro);
    }
});
