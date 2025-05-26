 const canvas = document.getElementById('tetris');
        const context = canvas.getContext('2d');
        context.scale(20, 20);

        
        const pecas = [
            // I
            [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            // J
            [
                [0, 0, 0],
                [1, 1, 1],
                [0, 0, 1]
            ],
            // L
            [
                [0, 0, 0],
                [1, 1, 1],
                [1, 0, 0]
            ],
            // O
            [
                [1, 1],
                [1, 1]
            ],
            // S
            [
                [0, 0, 0],
                [0, 1, 1],
                [1, 1, 0]
            ],
            // T
            [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]
            ],
            // Z
            [
                [0, 0, 0],
                [1, 1, 0],
                [0, 1, 1]
            ]
        ];

        function criarMatriz(largura, altura) {
            const matriz = [];
            while (altura--) {
                matriz.push(new Array(largura).fill(0));
            }
            return matriz;
        }

        function pecaAleatoria() {
            const randomIndex = Math.floor(Math.random() * pecas.length);
            return pecas[randomIndex];
        }

        function desenharMatriz(matriz, offset) {
            matriz.forEach((linha, y) => {
                linha.forEach((valor, x) => {
                    if (valor !== 0) {
                        context.fillStyle = 'cyan';
                        context.fillRect(x + offset.x, y + offset.y, 1, 1);
                    }
                });
            });
        }

        function colisao(arena, jogador) {
            const m = jogador.matrix;
            const o = jogador.pos;
            for (let y = 0; y < m.length; ++y) {
                for (let x = 0; x < m[y].length; ++x) {
                    if (m[y][x] !== 0 &&
                        (arena[y + o.y] &&
                            arena[y + o.y][x + o.x]) !== 0) {
                        return true;
                    }
                }
            }
            return false;
        }

        function mesclar(arena, jogador) {
            jogador.matrix.forEach((linha, y) => {
                linha.forEach((valor, x) => {
                    if (valor !== 0) {
                        arena[y + jogador.pos.y][x + jogador.pos.x] = valor;
                    }
                });
            });
        }

        let pontuacao = 0;
        let velocidadeBase = 1000; // Velocidade inicial (1 segundo)
        let velocidadeAtual = velocidadeBase;
        let nivel = 1;

        function limparLinhas() {
            let linhasRemovidas = 0;
            outer: for (let y = arena.length - 1; y >= 0; --y) {
                for (let x = 0; x < arena[y].length; ++x) {
                    if (arena[y][x] === 0) {
                        continue outer;
                    }
                }

                const linha = arena.splice(y, 1)[0].fill(0);
                arena.unshift(linha);
                ++y;

                linhasRemovidas++;
            }

            if (linhasRemovidas > 0) {
                // Aumenta a pontuação
                pontuacao += linhasRemovidas * 100;
                
                // Atualiza a velocidade baseado na pontuação
                const novoNivel = Math.floor(pontuacao / 50) + 1;
                if (novoNivel > nivel) {
                    nivel = novoNivel;
                    // Reduz o intervalo de queda em 50ms a cada nível
                    velocidadeAtual = Math.max(100, velocidadeBase - (nivel - 1) * 50);
                }
                
                document.getElementById('score').innerText = `Pontos: ${pontuacao} (Nível ${nivel})`;
            }
        }

        function rotacionar(matrix) {
            const N = matrix.length;
            
            // Rotação especial para peça O (não faz nada)
            if (N === 2) return matrix;
            
            // Cria uma cópia da matriz para rotacionar
            const novaMatrix = matrix.map(linha => [...linha]);
            
            // Rotação para outras peças
            for (let y = 0; y < N; ++y) {
                for (let x = 0; x < y; ++x) {
                    [novaMatrix[x][y], novaMatrix[y][x]] = [novaMatrix[y][x], novaMatrix[x][y]];
                }
            }
            
            // Inverte cada linha
            novaMatrix.forEach(linha => linha.reverse());
            
            return novaMatrix;
        }

        function desenhar() {
            context.fillStyle = '#000';
            context.fillRect(0, 0, canvas.width, canvas.height);

            desenharMatriz(arena, { x: 0, y: 0 });
            desenharMatriz(jogador.matrix, jogador.pos);
        }

        let contadorQueda = 0;
        let ultimoTempo = 0;

        function atualizar(tempo = 0) {
            const deltaTempo = tempo - ultimoTempo;
            ultimoTempo = tempo;
            contadorQueda += deltaTempo;
            if (contadorQueda > velocidadeAtual) {
                moverParaBaixo();
            }
            desenhar();
            requestAnimationFrame(atualizar);
        }

        function moverParaBaixo() {
            jogador.pos.y++;
            if (colisao(arena, jogador)) {
                jogador.pos.y--;
                mesclar(arena, jogador);
                limparLinhas();
                resetarJogador();
            }
            contadorQueda = 0;
        }

        function moverLado(dir) {
            jogador.pos.x += dir;
            if (colisao(arena, jogador)) {
                jogador.pos.x -= dir;
            }
        }

        function rotacionarJogador() {
            const matrixRotacionada = rotacionar(jogador.matrix);
            if (!colisao(arena, {
                matrix: matrixRotacionada,
                pos: jogador.pos
            })) {
                jogador.matrix = matrixRotacionada;
            }
        }

        function resetarJogador() {
            jogador.matrix = pecaAleatoria();
            jogador.pos.y = 0;
            jogador.pos.x = (arena[0].length / 2 | 0) - (jogador.matrix[0].length / 2 | 0);
            if (colisao(arena, jogador)) {
                arena.forEach(linha => linha.fill(0));
                pontuacao = 0;
                nivel = 1;
                velocidadeAtual = velocidadeBase;
                document.getElementById('score').innerText = 'Pontos: 0 (Nível 1)';
                alert("Fim de jogo!");
            }
        }

        const arena = criarMatriz(12, 20);
        const jogador = {
            pos: { x: 0, y: 0 },
            matrix: pecaAleatoria()
        };

        document.addEventListener('keydown', evento => {
            if (evento.key === 'ArrowLeft') {
                moverLado(-1);
            } else if (evento.key === 'ArrowRight') {
                moverLado(1);
            } else if (evento.key === 'ArrowDown') {
                moverParaBaixo();
            } else if (evento.key === 'ArrowUp') {
                rotacionarJogador();
            }
        });

        resetarJogador();
        atualizar();