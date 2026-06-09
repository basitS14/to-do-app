from flask import Blueprint, request, jsonify, session
from .models import db, Todo, User
from datetime import datetime

todo_bp = Blueprint('todo', __name__, url_prefix='/api/todos')

def check_auth():
    """Check if user is authenticated and return user_id"""
    user_id = session.get('user_id')
    if not user_id:
        return None, jsonify({'error': 'Unauthorized'}), 401
    return user_id, None, None

@todo_bp.route('', methods=['GET'])
def get_todos():
    """Get all todos for the current user"""
    try:
        user_id, error, status = check_auth()
        if error:
            return error, status
        
        # Query parameters for filtering
        completed = request.args.get('completed')
        priority = request.args.get('priority')
        
        query = Todo.query.filter_by(user_id=user_id)
        
        # Apply filters
        if completed is not None:
            completed_bool = completed.lower() == 'true'
            query = query.filter_by(completed=completed_bool)
        
        if priority:
            query = query.filter_by(priority=priority)
        
        # Order by created_at descending
        todos = query.order_by(Todo.created_at.desc()).all()
        
        return jsonify({
            'todos': [todo.to_dict() for todo in todos],
            'count': len(todos)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch todos: {str(e)}'}), 500

@todo_bp.route('/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """Get a specific todo"""
    try:
        user_id, error, status = check_auth()
        if error:
            return error, status
        
        todo = Todo.query.filter_by(id=todo_id, user_id=user_id).first()
        
        if not todo:
            return jsonify({'error': 'Todo not found'}), 404
        
        return jsonify({
            'todo': todo.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch todo: {str(e)}'}), 500

@todo_bp.route('', methods=['POST'])
def create_todo():
    """Create a new todo"""
    try:
        user_id, error, status = check_auth()
        if error:
            return error, status
        
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400
        
        title = data.get('title').strip()
        
        if len(title) < 1 or len(title) > 200:
            return jsonify({'error': 'Title must be between 1 and 200 characters'}), 400
        
        # Validate priority
        priority = data.get('priority', 'medium').lower()
        if priority not in ['low', 'medium', 'high']:
            return jsonify({'error': 'Priority must be low, medium, or high'}), 400
        
        # Parse due_date if provided
        due_date = None
        if data.get('due_date'):
            try:
                due_date = datetime.fromisoformat(data.get('due_date').replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use ISO 8601 format'}), 400
        
        # Create todo
        todo = Todo(
            title=title,
            description=data.get('description', '').strip(),
            priority=priority,
            due_date=due_date,
            user_id=user_id
        )
        
        db.session.add(todo)
        db.session.commit()
        
        return jsonify({
            'message': 'Todo created successfully',
            'todo': todo.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create todo: {str(e)}'}), 500

@todo_bp.route('/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """Update a todo"""
    try:
        user_id, error, status = check_auth()
        if error:
            return error, status
        
        todo = Todo.query.filter_by(id=todo_id, user_id=user_id).first()
        
        if not todo:
            return jsonify({'error': 'Todo not found'}), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'title' in data:
            title = data.get('title').strip()
            if len(title) < 1 or len(title) > 200:
                return jsonify({'error': 'Title must be between 1 and 200 characters'}), 400
            todo.title = title
        
        if 'description' in data:
            todo.description = data.get('description', '').strip()
        
        if 'completed' in data:
            todo.completed = bool(data.get('completed'))
        
        if 'priority' in data:
            priority = data.get('priority').lower()
            if priority not in ['low', 'medium', 'high']:
                return jsonify({'error': 'Priority must be low, medium, or high'}), 400
            todo.priority = priority
        
        if 'due_date' in data:
            if data.get('due_date'):
                try:
                    todo.due_date = datetime.fromisoformat(data.get('due_date').replace('Z', '+00:00'))
                except ValueError:
                    return jsonify({'error': 'Invalid date format. Use ISO 8601 format'}), 400
            else:
                todo.due_date = None
        
        db.session.commit()
        
        return jsonify({
            'message': 'Todo updated successfully',
            'todo': todo.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update todo: {str(e)}'}), 500

@todo_bp.route('/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Delete a todo"""
    try:
        user_id, error, status = check_auth()
        if error:
            return error, status
        
        todo = Todo.query.filter_by(id=todo_id, user_id=user_id).first()
        
        if not todo:
            return jsonify({'error': 'Todo not found'}), 404
        
        db.session.delete(todo)
        db.session.commit()
        
        return jsonify({
            'message': 'Todo deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete todo: {str(e)}'}), 500

@todo_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get statistics about user's todos"""
    try:
        user_id, error, status = check_auth()
        if error:
            return error, status
        
        total = Todo.query.filter_by(user_id=user_id).count()
        completed = Todo.query.filter_by(user_id=user_id, completed=True).count()
        pending = total - completed
        
        high_priority = Todo.query.filter_by(user_id=user_id, priority='high', completed=False).count()
        
        return jsonify({
            'stats': {
                'total': total,
                'completed': completed,
                'pending': pending,
                'high_priority': high_priority
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch stats: {str(e)}'}), 500

