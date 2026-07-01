import json
from pathlib import Path

root = Path('.')
lessons_path = root / 'data' / 'lessons.json'
quizzes_path = root / 'data' / 'quizzes.json'
games_path = root / 'data' / 'games.json'
projects_path = root / 'data' / 'projects.json'

with lessons_path.open('r', encoding='utf-8') as f:
    lessons_data = json.load(f)

with quizzes_path.open('r', encoding='utf-8') as f:
    quizzes_data = json.load(f)

existing_lessons = lessons_data.get('lessons', [])
existing_quizzes = quizzes_data.get('quizzes', {})

new_titles = [
    'Data Types and Values',
    'Operators and Expressions',
    'Control Flow',
    'Loops and Iteration',
    'Functions and Reusability',
    'Arrays and Lists',
    'Objects and Properties',
    'The Document Object Model',
    'DOM Events',
    'Forms and User Input',
    'Strings and Text',
    'Numbers and Math',
    'Debugging JavaScript',
    'Error Handling',
    'Scope and Hoisting',
    'Closures and Callbacks',
    'Array Methods',
    'Advanced Objects',
    'Promises and Async',
    'Async / Await',
    'Fetch API and APIs',
    'JSON and Data Exchange',
    'Local Storage',
    'Browser Storage',
    'Responsive JavaScript',
    'Animations and Transitions',
    'UI Components',
    'Testing Basics',
    'Performance Optimization',
    'Accessibility',
    'Security Basics',
    'Version Control with Git',
    'Package Managers',
    'Modern JavaScript (ES6+)',
    'Modules and Imports',
    'Build Tools',
    'React Introduction',
    'JSX and Templates',
    'React Components',
    'State and Props',
    'React Hooks',
    'React Routing',
    'Final Project'
]

new_lessons = []
for index, title in enumerate(new_titles, start=len(existing_lessons)):
    slug = title.lower().replace(' ', '-').replace('/', '')
    lesson = {
        'id': index,
        'title': title,
        'description': f'Learn {title.lower()} and build stronger JavaScript skills.',
        'level': 1 + (index // 6),
        'xp': 60,
        'coins': 25,
        'duration': '15',
        'mission': f'Master {title.lower()} and use it in real code.',
        'objectives': [
            f'Understand the basics of {title.lower()}',
            'See how it works in a code example',
            'Apply it with a short practice task'
        ],
        'story': f'{title} is an important part of modern JavaScript and helps you build richer web applications.',
        'storyTitle': f'Why {title} matters',
        'explanation': f'This lesson explains the key ideas behind {title.lower()} and how it helps you build interactive applications.',
        'summary': f'You learned the fundamentals of {title.lower()}, and you can now use it in your projects.',
        'quiz': [
            {
                'question': f'What is the main use of {title.lower()}?',
                'options': [
                    'To build visual layouts',
                    f'To understand and use {title.lower()}',
                    'To create static images',
                    'To write database queries'
                ],
                'correct': f'To understand and use {title.lower()}',
                'xp': 10
            },
            {
                'question': f'Which area is most closely related to {title.lower()}?',
                'options': [
                    'Cooking recipes',
                    'Building interactive web pages',
                    'Managing hardware drivers',
                    'Printing documents'
                ],
                'correct': 'Building interactive web pages',
                'xp': 10
            },
            {
                'question': f'Why is {title.lower()} useful?',
                'options': [
                    'It makes code harder to read',
                    'It helps write cleaner and more powerful web applications',
                    'It is only used for styling',
                    'It slows down the browser'
                ],
                'correct': 'It helps write cleaner and more powerful web applications',
                'xp': 10
            }
        ]
    }
    new_lessons.append(lesson)

# Extend lessons to 48 total entries if needed
if len(existing_lessons) < 48:
    lessons_data['lessons'] = existing_lessons + new_lessons[:48 - len(existing_lessons)]

# Extend quizzes.json to match lesson count
quiz_data = existing_quizzes.copy()
for lesson in lessons_data['lessons']:
    lesson_id = str(lesson['id'])
    if lesson_id not in quiz_data or not quiz_data[lesson_id]:
        quiz_data[lesson_id] = [
            {
                'question': f'What is one key idea from {lesson["title"].lower()}?',
                'options': [
                    'It is only used for design',
                    'It helps build interactive JavaScript applications',
                    'It is a graphic format',
                    'It only works offline'
                ],
                'correct': 'It helps build interactive JavaScript applications',
                'xp': 10
            },
            {
                'question': f'Which of these is true about {lesson["title"].lower()}?',
                'options': [
                    'It makes pages static',
                    'It helps you learn JavaScript concepts',
                    'It is unrelated to coding',
                    'It only runs on servers'
                ],
                'correct': 'It helps you learn JavaScript concepts',
                'xp': 10
            },
            {
                'question': f'In JavaScript, why do developers care about {lesson["title"].lower()}?',
                'options': [
                    'To create interactive experiences',
                    'To format plain text',
                    'To build hardware devices',
                    'To avoid learning programming'
                ],
                'correct': 'To create interactive experiences',
                'xp': 10
            }
        ]

## Update quizzes file structure
quizzes_data['quizzes'] = quiz_data

# Add sample games if empty or missing
if not games_path.exists() or games_path.stat().st_size == 0:
    games_data = {
        'games': [
            {
                'id': 'game-1',
                'title': 'Code Runner',
                'description': 'Solve short JavaScript puzzles to earn points.',
                'difficulty': 'Easy',
                'xp': 30,
                'coins': 15,
                'status': 'Ready'
            },
            {
                'id': 'game-2',
                'title': 'Bug Hunter',
                'description': 'Find and fix bugs in broken code snippets.',
                'difficulty': 'Medium',
                'xp': 45,
                'coins': 20,
                'status': 'Ready'
            },
            {
                'id': 'game-3',
                'title': 'DOM Dash',
                'description': 'Interact with the page and complete DOM challenges.',
                'difficulty': 'Medium',
                'xp': 50,
                'coins': 25,
                'status': 'Ready'
            }
        ]
    }
    with games_path.open('w', encoding='utf-8') as f:
        json.dump(games_data, f, indent=2)

# Add sample projects if empty or missing
if not projects_path.exists() or projects_path.stat().st_size == 0:
    projects_data = {
        'projects': [
            {
                'id': 'project-1',
                'title': 'Personal Portfolio',
                'description': 'Create a portfolio website to showcase your JavaScript projects.',
                'xp': 100,
                'coins': 50,
                'status': 'In Progress'
            },
            {
                'id': 'project-2',
                'title': 'Interactive Quiz App',
                'description': 'Build a quiz app that asks questions and shows scores.',
                'xp': 120,
                'coins': 60,
                'status': 'Not Started'
            },
            {
                'id': 'project-3',
                'title': 'React Mini App',
                'description': 'Start learning React by building a small interactive app.',
                'xp': 150,
                'coins': 80,
                'status': 'Not Started'
            }
        ]
    }
    with projects_path.open('w', encoding='utf-8') as f:
        json.dump(projects_data, f, indent=2)

with lessons_path.open('w', encoding='utf-8') as f:
    json.dump(lessons_data, f, indent=2)

with quizzes_path.open('w', encoding='utf-8') as f:
    json.dump(quizzes_data, f, indent=2)

print('Lesson count:', len(lessons_data['lessons']))
print('Quiz keys:', len(quizzes_data['quizzes']))
print('Games file created:', games_path.exists())
print('Projects file created:', projects_path.exists())
