import { User } from '../domain/model/user.entity';
import { ProfileResponse, UserResponse } from './user-response';

export class UserAssembler {
  static toDomain(response: UserResponse): User {
    return new User(
      response.id,
      response.name,
      response.email,
      response.password,
      response.phone,
      response.membershipPlanId,
      response.isActive,
      response.profilePicture,
      response.dateOfBirth,
      response.address,
      response.emergencyContact,
      response.verificationStatus,
      new Date(response.registrationDate),
      response.preferences,
      response.statistics
    );
  }

  static toDomainList(responses: UserResponse[]): User[] {
    return responses.map(response => this.toDomain(response));
  }

  static fromProfile(p: ProfileResponse): User {
    return new User(
      p.id,
      `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Usuario',
      p.email ?? '',
      0,
      '',
      '',
      true,
      '',
      '',
      '',
      '',
      'unverified',
      new Date(),
      { language: 'es', notifications: true, theme: 'light' },
      { totalTrips: 0, totalDistance: 0, totalSpent: 0, averageRating: 0 }
    );
  }
}
