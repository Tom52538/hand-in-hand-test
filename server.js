<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Arbeitszeiterfassung</title>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: auto; padding: 20px; }
    input, button { display: block; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Arbeitszeiterfassung</h1>
    <form id="workHoursForm">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" required>

      <label for="date">Datum:</label>
      <input type="date" id="date" name="date" required>

      <label for="startTime">Arbeitsbeginn:</label>
      <input type="time" id="startTime" name="startTime" required>

      <label for="endTime">Arbeitsende:</label>
      <input type="time" id="endTime" name="endTime" required>

      <button type="submit">Eintragen</button>
    </form>

    <h2>Gebuchte Arbeitszeiten</h2>
    <ul id="workHoursList"></ul>

    <h2>Gesamtarbeitszeit</h2>
    <p id="totalHours"></p>

    <button id="downloadCsv">CSV herunterladen</button>
  </div>

  <script>
    document.getElementById('workHoursForm').addEventListener('submit', async function(event) {
      event.preventDefault();

      const name = document.getElementById('name').value;
      const date = document.getElementById('date').value;
      const startTime = document.getElementById('startTime').value;
      const endTime = document.getElementById('endTime').value;

      const response = await fetch('/log-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, date, startTime, endTime })
      });

      if (response.ok) {
        loadWorkHours(name);
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    });

    async function loadWorkHours(name) {
      const response = await fetch(`/work-hours?name=${encodeURIComponent(name)}`);
      const data = await response.json();
      const workHoursList = document.getElementById('workHoursList');
      workHoursList.innerHTML = '';

      let totalHours = 0;

      data.workHours.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = `Name: ${entry.name}, Datum: ${entry.date}, Stunden: ${entry.hours}`;
        workHoursList.appendChild(listItem);

        const [hours, minutes] = entry.hours.split(' ');
        totalHours += parseInt(hours) + parseInt(minutes) / 60;
      });

      document.getElementById('totalHours').textContent = `Gesamtarbeitszeit: ${formatHours(totalHours)}`;
    }

    function formatHours(hours) {
      const minutes = Math.round((hours % 1) * 60);
      const formattedHours = Math.floor(hours);
      return `${formattedHours}h ${minutes}min`;
    }

    document.getElementById('downloadCsv').addEventListener('click', async function() {
      const name = document.getElementById('name').value;
      window.location.href = `/download-csv?name=${encodeURIComponent(name)}`;
    });
  </script>
</body>
</html>
