document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('visitaForm');
    const formStatus = document.getElementById('form-status');
    const telefoneInput = document.getElementById('telefone');

    // Função para formatar o telefone em tempo real
    telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não for dígito
        let formattedValue = '';

        if (value.length > 0) {
            formattedValue = '(' + value.substring(0, 2);
        }
        if (value.length > 2) {
            formattedValue += ') ' + value.substring(2, 7);
        }
        if (value.length > 7) {
            formattedValue += '-' + value.substring(7, 11);
        }

        e.target.value = formattedValue;
    });

    // Código original de envio do formulário
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Impede o recarregamento da página

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const formAction = 'https://formspree.io/f/xkgvkrjy';

        fetch(formAction, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                formStatus.textContent = 'Mensagem enviada com sucesso! Em breve, nossa equipe entrará em contato.';
                formStatus.className = 'form-status-message success';
                form.reset(); // Limpa o formulário
            } else {
                formStatus.textContent = 'Ocorreu um erro ao enviar. Por favor, tente novamente mais tarde.';
                formStatus.className = 'form-status-message error';
            }
            formStatus.style.display = 'block'; // Torna a mensagem visível
        })
        .catch(error => {
            console.error('Erro de envio:', error);
            formStatus.textContent = 'Ocorreu um erro ao enviar. Por favor, verifique sua conexão.';
            formStatus.className = 'form-status-message error';
            formStatus.style.display = 'block';
        });
    });
});