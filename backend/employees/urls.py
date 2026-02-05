from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, AttendanceViewSet, EmployeeAttendanceList

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
# We map AttendanceViewSet to 'attendance' for standard CRUD
router.register(r'attendance', AttendanceViewSet)

urlpatterns = [
    # Specific route for employee attendance by UUID
    path('attendance/<uuid:employee_id>/', EmployeeAttendanceList.as_view(), name='employee-attendance'),
    path('', include(router.urls)),
]
