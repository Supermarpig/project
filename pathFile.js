document.addEventListener('DOMContentLoaded', function () {
    fetch('projects.json')
        .then(response => response.json())
        .then(projects => {
            projects.forEach(project => {
                let projectList;
                switch (project.type) {
                    case 'css':
                        projectList = document.getElementById('css-projects');
                        break;
                    case 'js':
                        projectList = document.getElementById('js-projects');
                        break;
                    case 'gsap':
                        projectList = document.getElementById('gsap-projects');
                        break;
                    case 'gpt':
                        projectList = document.getElementById('gpt-projects');
                        break;
                    default:
                        console.error('未知的專案類型:', project.type);
                        return;
                }

                if (projectList) {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = project.path;
                    link.textContent = project.name;
                    // 設置為塊元素，使整個 li 可點擊
                    link.style.display = 'block';
                    link.style.height = '100%';
                    listItem.appendChild(link);
                    projectList.appendChild(listItem);

                    // 為 listItem 添加點擊事件
                    listItem.addEventListener('click', function () {
                        window.location.href = link.href;
                    });
                }
            });
        })
        .catch(error => console.error('無法加載項目列表:', error));
});
