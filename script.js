// Fonction pour formater les nombres (enlever uniquement les zéros décimaux inutiles)
function formatNumber(num) {
    if (Math.abs(num) < 1e-10) return '0';
    const rounded = Math.round(num * 10000) / 10000;
    // Ne supprimer les zéros que s'il y a un point décimal
    const str = rounded.toString();
    if (str.includes('.')) {
        return str.replace(/\.?0+$/, '');
    }
    return str;
}

// Système de notifications Toast
function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'error' ? '❌' : '✅';
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Supprimer le toast après 5 secondes
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 5000);
}

// Dark Mode Toggle
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        if (theme === 'dark') {
            // Sun icon (light mode)
            themeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5f7470" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>`;
        } else {
            // Moon icon (dark mode)
            themeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5f7470" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>`;
        }
    }
}

// Navigation entre les pages
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Gestion de la navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // Mettre à jour les liens actifs
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Afficher la bonne page
            pages.forEach(page => {
                if (page.id === targetPage) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });
        });
    });

    // Liens inline vers le résolveur
    document.querySelectorAll('[data-page="resolveur"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('[data-page="resolveur"].nav-link').click();
        });
    });

    // Génération du formulaire
    document.getElementById('generateForm').addEventListener('click', generateForm);
    
    // Résolution du problème
    document.getElementById('solveBtn').addEventListener('click', solveSimplex);
});

// Génération dynamique du formulaire
function generateForm() {
    const numVars = parseInt(document.getElementById('numVars').value);
    const numConstraints = parseInt(document.getElementById('numConstraints').value);

    if (numVars < 2 || numVars > 10) {
        showToast('Le nombre de variables doit être entre 2 et 10', 'error');
        return;
    }
    
    if (numConstraints < 1 || numConstraints > 10) {
        showToast('Le nombre de contraintes doit être entre 1 et 10', 'error');
        return;
    }

    // Générer les inputs pour la fonction objectif
    const objectiveInputs = document.getElementById('objectiveInputs');
    objectiveInputs.innerHTML = '';
    
    for (let i = 1; i <= numVars; i++) {
        const span = document.createElement('span');
        span.innerHTML = `<input type="number" class="coef-input" id="c${i}" placeholder="c${i}" value="0" step="any"> x<sub>${i}</sub>`;
        if (i < numVars) {
            span.innerHTML += ' + ';
        }
        objectiveInputs.appendChild(span);
    }

    // Générer les inputs pour les contraintes
    const constraintsInputs = document.getElementById('constraintsInputs');
    constraintsInputs.innerHTML = '';

    for (let i = 1; i <= numConstraints; i++) {
        const constraintDiv = document.createElement('div');
        constraintDiv.className = 'constraint-row';
        constraintDiv.innerHTML = `<span class="constraint-label">Contrainte ${i}:</span>`;
        
        for (let j = 1; j <= numVars; j++) {
            const span = document.createElement('span');
            span.innerHTML = `<input type="number" class="coef-input" id="a${i}${j}" placeholder="a${i}${j}" value="0" step="any"> x<sub>${j}</sub>`;
            if (j < numVars) {
                span.innerHTML += ' + ';
            }
            constraintDiv.appendChild(span);
        }
        
        constraintDiv.innerHTML += ` ≤ <input type="number" class="coef-input" id="b${i}" placeholder="b${i}" value="0" step="any">`;
        constraintsInputs.appendChild(constraintDiv);
    }

    // Afficher le formulaire
    document.getElementById('inputForm').style.display = 'block';
    document.getElementById('results').style.display = 'none';
}

// Classe pour l'algorithme du Simplexe
class SimplexSolver {
    constructor(c, A, b) {
        this.c = c; // Coefficients de la fonction objectif
        this.A = A; // Matrice des contraintes
        this.b = b; // Seconds membres
        this.numVars = c.length;
        this.numConstraints = b.length;
        this.iterations = [];
        this.tableau = [];
        this.basicVars = [];
        this.nonBasicVars = [];
    }

    // Initialiser le tableau du simplexe
    initializeTableau() {
        const m = this.numConstraints;
        const n = this.numVars;
        
        // Créer le tableau avec les variables d'écart
        this.tableau = [];
        
        // Lignes des contraintes
        for (let i = 0; i < m; i++) {
            const row = [...this.A[i]];
            // Ajouter les variables d'écart
            for (let j = 0; j < m; j++) {
                row.push(i === j ? 1 : 0);
            }
            // Ajouter le second membre
            row.push(this.b[i]);
            this.tableau.push(row);
        }
        
        // Ligne Z (fonction objectif)
        const zRow = [];
        for (let i = 0; i < n; i++) {
            zRow.push(this.c[i]);
        }
        // Variables d'écart dans Z
        for (let i = 0; i < m; i++) {
            zRow.push(0);
        }
        // Valeur de Z
        zRow.push(0);
        this.tableau.push(zRow);

        // Variables de base initiales (variables d'écart)
        this.basicVars = [];
        for (let i = 0; i < m; i++) {
            this.basicVars.push(n + i);
        }
    }

    // Vérifier si la solution est optimale
    isOptimal() {
        const zRow = this.tableau[this.tableau.length - 1];
        // Exclure la dernière colonne (valeur de Z)
        for (let i = 0; i < zRow.length - 1; i++) {
            if (zRow[i] > 1e-10) { // Chercher les coefficients positifs
                return false;
            }
        }
        return true;
    }

    // Trouver la colonne entrante (règle de Dantzig)
    findEnteringColumn() {
        const zRow = this.tableau[this.tableau.length - 1];
        let maxValue = 0;
        let enteringCol = -1;
        
        for (let i = 0; i < zRow.length - 1; i++) {
            if (zRow[i] > maxValue) {
                maxValue = zRow[i];
                enteringCol = i;
            }
        }
        
        return enteringCol;
    }

    // Trouver la ligne sortante (test du ratio minimum)
    findLeavingRow(enteringCol) {
        let minRatio = Infinity;
        let leavingRow = -1;
        
        for (let i = 0; i < this.tableau.length - 1; i++) {
            const coefficient = this.tableau[i][enteringCol];
            const rhs = this.tableau[i][this.tableau[i].length - 1];
            
            if (coefficient > 1e-10) { // Coefficient positif
                const ratio = rhs / coefficient;
                if (ratio < minRatio) {
                    minRatio = ratio;
                    leavingRow = i;
                }
            }
        }
        
        return leavingRow;
    }

    // Effectuer l'opération de pivot
    pivot(enteringCol, leavingRow) {
        const pivotElement = this.tableau[leavingRow][enteringCol];
        const operations = [];
        
        // Diviser la ligne du pivot par l'élément pivot
        operations.push(`L<sub>${leavingRow + 1}</sub> ← L<sub>${leavingRow + 1}</sub> / ${formatNumber(pivotElement)}`);
        for (let j = 0; j < this.tableau[leavingRow].length; j++) {
            this.tableau[leavingRow][j] /= pivotElement;
        }
        
        // Effectuer les opérations sur les autres lignes
        for (let i = 0; i < this.tableau.length; i++) {
            if (i !== leavingRow) {
                const factor = this.tableau[i][enteringCol];
                if (Math.abs(factor) > 1e-10) {
                    const rowName = i === this.tableau.length - 1 ? 'Z' : `${i + 1}`;
                    const sign = factor > 0 ? '-' : '+';
                    const absFactorStr = formatNumber(Math.abs(factor));
                    operations.push(`L<sub>${rowName}</sub> ← L<sub>${rowName}</sub> ${sign} ${absFactorStr} × L<sub>${leavingRow + 1}</sub>`);
                    
                    for (let j = 0; j < this.tableau[i].length; j++) {
                        this.tableau[i][j] -= factor * this.tableau[leavingRow][j];
                    }
                }
            }
        }
        
        // Mettre à jour les variables de base
        this.basicVars[leavingRow] = enteringCol;
        
        return operations;
    }

    // Résoudre le problème
    solve() {
        this.initializeTableau();
        
        // Sauvegarder l'état initial
        this.iterations.push({
            iteration: 0,
            tableau: this.copyTableau(),
            basicVars: [...this.basicVars],
            message: "Tableau initial"
        });

        let iterationCount = 0;
        const maxIterations = 100;

        while (!this.isOptimal() && iterationCount < maxIterations) {
            iterationCount++;
            
            // Trouver la variable entrante
            const enteringCol = this.findEnteringColumn();
            if (enteringCol === -1) break;
            
            // Trouver la variable sortante
            const leavingRow = this.findLeavingRow(enteringCol);
            
            if (leavingRow === -1) {
                showToast('Le problème est non borné (solution infinie)', 'error');
                return {
                    success: false,
                    message: "Le problème est non borné (solution infinie)."
                };
            }
            
            const leavingVar = this.basicVars[leavingRow];
            
            // Sauvegarder l'information avant le pivot
            const enteringVarName = enteringCol < this.numVars ? `x${enteringCol + 1}` : `e${enteringCol - this.numVars + 1}`;
            const leavingVarName = leavingVar < this.numVars ? `x${leavingVar + 1}` : `e${leavingVar - this.numVars + 1}`;
            
            this.iterations.push({
                iteration: iterationCount,
                tableau: this.copyTableau(),
                basicVars: [...this.basicVars],
                enteringCol: enteringCol,
                leavingRow: leavingRow,
                enteringVar: enteringCol,
                leavingVar: leavingVar,
                pivotElement: this.tableau[leavingRow][enteringCol],
                message: `Itération ${iterationCount}: Variable ${enteringVarName} entre, variable ${leavingVarName} sort`
            });
            
            // Effectuer le pivot et récupérer les opérations
            const operations = this.pivot(enteringCol, leavingRow);
            
            // Sauvegarder le tableau après pivot avec les opérations
            this.iterations.push({
                iteration: iterationCount,
                tableau: this.copyTableau(),
                basicVars: [...this.basicVars],
                operations: operations,
                message: `Après pivot (Itération ${iterationCount})`
            });
        }

        if (iterationCount >= maxIterations) {
            showToast('Nombre maximum d\'itérations atteint (100)', 'error');
            return {
                success: false,
                message: "Nombre maximum d'itérations atteint."
            };
        }

        // Sauvegarder le tableau final
        this.iterations.push({
            iteration: iterationCount + 1,
            tableau: this.copyTableau(),
            basicVars: [...this.basicVars],
            message: "Solution optimale trouvée"
        });

        // Extraire la solution
        return this.extractSolution();
    }

    // Copier le tableau
    copyTableau() {
        return this.tableau.map(row => [...row]);
    }

    // Extraire la solution finale
    extractSolution() {
        const solution = new Array(this.numVars + this.numConstraints).fill(0);
        
        // Les variables de base ont des valeurs non nulles
        for (let i = 0; i < this.basicVars.length; i++) {
            const varIndex = this.basicVars[i];
            const value = this.tableau[i][this.tableau[i].length - 1];
            solution[varIndex] = value;
        }
        
        // Valeur de la fonction objectif (multiplier par -1 pour l'affichage)
        const zValue = -this.tableau[this.tableau.length - 1][this.tableau[0].length - 1];
        
        return {
            success: true,
            optimalValue: zValue,
            variables: solution.slice(0, this.numVars),
            allVariables: solution
        };
    }
}

// Résoudre le problème du simplexe
function solveSimplex() {
    const numVars = parseInt(document.getElementById('numVars').value);
    const numConstraints = parseInt(document.getElementById('numConstraints').value);

    // Lire les coefficients de la fonction objectif
    const c = [];
    for (let i = 1; i <= numVars; i++) {
        const value = parseFloat(document.getElementById(`c${i}`).value);
        if (isNaN(value)) {
            showToast(`Veuillez entrer une valeur valide pour c${i}`, 'error');
            return;
        }
        c.push(value);
    }

    // Lire la matrice des contraintes
    const A = [];
    const b = [];
    for (let i = 1; i <= numConstraints; i++) {
        const row = [];
        for (let j = 1; j <= numVars; j++) {
            const value = parseFloat(document.getElementById(`a${i}${j}`).value);
            if (isNaN(value)) {
                showToast(`Veuillez entrer une valeur valide pour a${i}${j}`, 'error');
                return;
            }
            row.push(value);
        }
        A.push(row);
        
        const bValue = parseFloat(document.getElementById(`b${i}`).value);
        if (isNaN(bValue)) {
            showToast(`Veuillez entrer une valeur valide pour b${i}`, 'error');
            return;
        }
        if (bValue < 0) {
            showToast(`Les valeurs de b doivent être positives. b${i} = ${bValue}`, 'error');
            return;
        }
        b.push(bValue);
    }

    // Créer le solver et résoudre
    const solver = new SimplexSolver(c, A, b);
    const result = solver.solve();

    // Afficher les résultats
    displayResults(solver, result, numVars, numConstraints);
}

// Afficher les résultats
function displayResults(solver, result, numVars, numConstraints) {
    const resultsDiv = document.getElementById('results');
    const iterationsDisplay = document.getElementById('iterationsDisplay');
    const finalSolution = document.getElementById('finalSolution');

    iterationsDisplay.innerHTML = '';
    finalSolution.innerHTML = '';

    if (!result.success) {
        iterationsDisplay.innerHTML = `<div class="error-message">${result.message}</div>`;
        resultsDiv.style.display = 'block';
        showToast(result.message, 'error');
        return;
    }
    
    // Afficher un message de succès
    showToast('Problème résolu avec succès! 🎉', 'success');

    // Afficher chaque itération
    solver.iterations.forEach((iter, index) => {
        const iterDiv = document.createElement('div');
        iterDiv.className = 'iteration';
        
        let html = `<h3>${iter.message}</h3>`;
        
        // Afficher les combinaisons linéaires AVANT le tableau (si elles existent)
        if (iter.operations) {
            html += '<div class="linear-combinations">';
            html += '<h4>Opérations de pivot :</h4>';
            html += '<ul>';
            iter.operations.forEach(op => {
                html += `<li>${op}</li>`;
            });
            html += '</ul></div>';
        }
        
        // Informations sur l'itération (avant pivot)
        if (iter.enteringCol !== undefined && !iter.operations) {
            const enteringVarName = iter.enteringVar < numVars ? `x<sub>${iter.enteringVar + 1}</sub>` : `e<sub>${iter.enteringVar - numVars + 1}</sub>`;
            const leavingVarName = iter.leavingVar < numVars ? `x<sub>${iter.leavingVar + 1}</sub>` : `e<sub>${iter.leavingVar - numVars + 1}</sub>`;
            html += `<div class="iteration-info">
                <p><strong>Variable entrante:</strong> ${enteringVarName} (colonne ${iter.enteringCol + 1})</p>
                <p><strong>Variable sortante:</strong> ${leavingVarName} (ligne ${iter.leavingRow + 1})</p>
                <p><strong>Élément pivot:</strong> ${formatNumber(iter.pivotElement)}</p>
            </div>`;
        }
        
        // Afficher le tableau avec les bonnes variables de base
        html += '<div class="tableau-container">';
        html += createTableHTML(iter.tableau, numVars, numConstraints, iter.enteringCol, iter.leavingRow, iter.basicVars);
        html += '</div>';
        
        iterDiv.innerHTML = html;
        iterationsDisplay.appendChild(iterDiv);
    });

    // Afficher la solution finale
    if (result.success) {
        let solutionHTML = `
            <h3>🎉 Solution Optimale</h3>
            <p class="solution-optimal">Z<sub>max</sub> = ${formatNumber(result.optimalValue)}</p>
            <h4>Valeurs des variables :</h4>
        `;
        
        for (let i = 0; i < numVars; i++) {
            solutionHTML += `<p>x<sub>${i + 1}</sub> = ${formatNumber(result.variables[i])}</p>`;
        }
        
        finalSolution.innerHTML = solutionHTML;
    }

    resultsDiv.style.display = 'block';
    
    // Faire défiler jusqu'aux résultats
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Créer le HTML du tableau
function createTableHTML(tableau, numVars, numConstraints, enteringCol, leavingRow, basicVars) {
    const totalVars = numVars + numConstraints;
    let html = '<table><thead><tr><th>Base</th>';
    
    // En-têtes des colonnes
    for (let i = 0; i < numVars; i++) {
        const colClass = (i === enteringCol) ? ' class="entering-col"' : '';
        html += `<th${colClass}>x<sub>${i + 1}</sub></th>`;
    }
    for (let i = 0; i < numConstraints; i++) {
        const colClass = (numVars + i === enteringCol) ? ' class="entering-col"' : '';
        html += `<th${colClass}>e<sub>${i + 1}</sub></th>`;
    }
    html += '<th>2ème membre</th>';
    
    // Ajouter colonne Ratio si on a une colonne entrante
    if (enteringCol !== undefined && leavingRow !== undefined) {
        html += '<th>Ratio</th>';
    }
    html += '</tr></thead><tbody>';
    
    // Lignes des contraintes
    for (let i = 0; i < tableau.length - 1; i++) {
        const rowClass = (i === leavingRow) ? ' class="leaving-row"' : '';
        html += `<tr${rowClass}>`;
        
        // Nom de la variable de base
        const basicVarIndex = basicVars ? basicVars[i] : getBasicVarIndex(tableau, i, totalVars);
        const basicVarName = basicVarIndex < numVars ? `x<sub>${basicVarIndex + 1}</sub>` : `e<sub>${basicVarIndex - numVars + 1}</sub>`;
        html += `<td><strong>${basicVarName}</strong></td>`;
        
        // Valeurs du tableau
        for (let j = 0; j < tableau[i].length; j++) {
            const isPivot = (i === leavingRow && j === enteringCol);
            const cellClass = isPivot ? ' class="pivot-cell"' : '';
            html += `<td${cellClass}>${formatNumber(tableau[i][j])}</td>`;
        }
        
        // Calculer et afficher le ratio
        if (enteringCol !== undefined && leavingRow !== undefined) {
            const coefficient = tableau[i][enteringCol];
            const rhs = tableau[i][tableau[i].length - 1];
            let ratioText = '-';
            // Afficher le ratio sauf si le coefficient est zéro (division impossible)
            if (Math.abs(coefficient) > 1e-10) {
                const ratio = rhs / coefficient;
                ratioText = formatNumber(ratio);
                if (i === leavingRow) {
                    ratioText = `<strong>${ratioText}</strong>`;
                }
            }
            html += `<td>${ratioText}</td>`;
        }
        
        html += '</tr>';
    }
    
    // Ligne Z
    html += '<tr class="z-row"><td><strong>Z</strong></td>';
    const zRow = tableau[tableau.length - 1];
    for (let j = 0; j < zRow.length; j++) {
        html += `<td>${formatNumber(zRow[j])}</td>`;
    }
    
    // Cellule vide pour la colonne ratio
    if (enteringCol !== undefined && leavingRow !== undefined) {
        html += '<td>-</td>';
    }
    
    html += '</tr>';
    
    html += '</tbody></table>';
    return html;
}

// Trouver l'index de la variable de base
function getBasicVarIndex(tableau, row, totalVars) {
    for (let col = 0; col < totalVars; col++) {
        let isBasic = true;
        let hasOne = false;
        
        for (let r = 0; r < tableau.length - 1; r++) {
            const value = Math.abs(tableau[r][col]);
            if (r === row) {
                if (Math.abs(value - 1) < 1e-6) {
                    hasOne = true;
                } else {
                    isBasic = false;
                    break;
                }
            } else {
                if (value > 1e-6) {
                    isBasic = false;
                    break;
                }
            }
        }
        
        if (isBasic && hasOne) {
            return col;
        }
    }
    return 0;
}

// Fonction showError supprimée - remplacée par showToast
