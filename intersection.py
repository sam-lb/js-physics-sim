"""
Line segment intersection algorithm:
    https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
    
Separating axis theorem (used for detecting OBB collisions and finding minimum translation distance:
    https://en.wikipedia.org/wiki/Hyperplane_separation_theorem
    
OBB overlap resolution code modified and translated to python from c++ code written by Randy Gaul:
    https://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-oriented-rigid-bodies--gamedev-8032

Code by Sam Brunacini
"""

from math import sqrt, sin, cos, pi, atan2


HALF_PI = pi / 2
TWO_PI = pi * 2


def check_segment_segment_intersection(x1, y1, x2, y2, x3, y3, x4, y4):
    """ Check if two segments overlap. If they do, return t, the time in the first line's 0 <= t <= 1parameterization at which they intersect """
    denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if (denom == 0): return None
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    if not (0 <= t <= 1): return None
    u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom
    if not (0 <= u <= 1): return None

    return t

def segment_segment_intersection(x1, y1, x2, y2, x3, y3, x4, y4):
    """ Return point of intersection between two segments, if it exists """
    t = check_segment_segment_intersection(x1, y1, x2, y2, x3, y3, x4, y4)
    if t is not None:
        return segment_segment_intersection_2(x1, y1, x2, y2, t)
    return None

def segment_segment_intersection_2(x1, y1, x2, y2, t):
    """ Return point of intersection between two segments given t value """
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)]

def normalized(vec):
    """ Return a normalized version of the vector vec. If vec is the zero vector, return the zero vector """
    if vec[0] == 0 and vec[1] == 0: return [0, 0]
    mag = sqrt(vec[0] * vec[0] + vec[1] * vec[1])
    return [vec[0] / mag, vec[1] / mag]

def scaled_to_length(vec, length):
    """ Return a vector with the direction of vec and magnitude of length """
    norm = normalized(vec)
    return [norm[0] * length, norm[1] * length]

def dot(vec1, vec2):
    """ Return the dot product of vec1 and vec2 """
    return vec1[0]*vec2[0] + vec1[1]*vec2[1]

def add_vecs(vec1, vec2):
    """ Return the vector sum of vec1 and vec2 """
    return [vec1[0] + vec2[0], vec1[1] + vec2[1]]


class Segment:

    """
    Represents a line segment
    p1: Start point of segment
    p2: End point of segment
    color: Color of segment
    """

    def __init__(self, p1, p2, color=(255,0,0)):
        self.p1 = p1
        self.p2 = p2
        self.color = color

    def intersect(self, other):
        """ Return the point of intersection with the Segment "other" as a Point object, if it exists """
        result = intersection.segment_segment_intersection(*self.p1, *self.p2, *other.p1, *other.p2)
        if result is not None: return Point(result[0], result[1])
        return None


class Point:

    """
    Represents a point
    x: x coordinate
    y: y coordinate
    color: Color of point
    """

    def __init__(self, x, y, color=(255,0,0)):
        self.p = [int(x),int(y)]
        self.color = color
        self.radius = 5

    def __getitem__(self, i):
        return self.p[i]

    @classmethod
    def centroid(self, points):
        """ Returns the centroid (midpoint) of the points in the pointlist "points" """
        x = y = 0
        for point in points:
            x += point[0]
            y += point[1]
        return Point(x / len(points), y / len(points))


class OBB:

    """
    Represents an OBB / Oriented Bounding Box (a rectangle than can have any orientation, i.e. not necessarily axis-aligned)
    cx: x coordinate of the OBB's center
    cy: y coordinate of the OBB's center
    w: Width of the OBB in the x direction if it were axis-aligned
    h: Height of the OBB in the y direction if it were axis-aligned
    angle: Orientation of the OBB, in radians
    color: Color of the OBB
    """

    def __init__(self, cx, cy, w, h, angle=0, color=(0,150,255)):
        self.center = [cx, cy]
        self.w, self.h = w, h
        self.half_w, self.half_h = w / 2, h / 2
        self.angle = angle
        self.color = color

        self._compute_vertices()

    def _compute_vertices(self):
        """ Compute the four corner points and four edges of the OBB """
        xv = self.half_w * cos(self.angle), self.half_w * sin(self.angle)
        yv = self.half_h * cos(self.angle+HALF_PI), self.half_h * sin(self.angle+HALF_PI)

        self.vertices = [
            [self.center[0] - xv[0] - yv[0], self.center[1] - xv[1] - yv[1]],
            [self.center[0] + xv[0] - yv[0], self.center[1] + xv[1] - yv[1]],
            [self.center[0] + xv[0] + yv[0], self.center[1] + xv[1] + yv[1]],
            [self.center[0] - xv[0] + yv[0], self.center[1] - xv[1] + yv[1]],
        ]

        self.edges = [
            Segment(self.vertices[0], self.vertices[1]),
            Segment(self.vertices[1], self.vertices[2]),
            Segment(self.vertices[2], self.vertices[3]),
            Segment(self.vertices[3], self.vertices[0]),
        ]
        self._compute_normals()


    def _compute_normals(self):
        """ Compute the normal vectors of each face of the OBB """
        self.normals = []
        end = []
        for i, vert in enumerate(self.vertices):
            next_vert = self.vertices[(i+1)%len(self.vertices)]
            self.normals.append(normalized([next_vert[1] - vert[1], vert[0] - next_vert[0]]))
            end.append([-self.normals[i][0], -self.normals[i][1]])
        self.normals += end

    def _get_support(self, direction):
        """ Compute the support point (point in polygon at overlap depth) given a direction vector """
        max_proj = None

        for v in self.vertices:
            proj = dot(v, direction)
            if max_proj is None or proj > max_proj:
                max_vert = v
                max_proj = proj

        return max_vert

    def _find_least_penetration(self, obb):
        """ Find the index of the colliding normal and with another obb and the minimal translation distance. If no collision, return None """
        max_distance = None

        for i in range(len(self.vertices)):
            norm = self.normals[i]
            support = obb._get_support([-norm[0], -norm[1]])
            vert = self.vertices[i]

            dist = dot(norm, [support[0] - vert[0], support[1] - vert[1]])

            if (max_distance is None) or dist > max_distance:
                max_distance = dist
                max_index = i

        if max_distance >= 0:
            return None
        return max_index, max_distance

    def intersect(self, obb):
        """ If colliding with obb, resolve the collision and return the two resolution vectors. Otherwise, return None """
        result = self._find_least_penetration(obb)
        if result is None: return None
        axis1, penetration1 = result

        result = obb._find_least_penetration(self)
        if result is None: return None
        axis2, penetration2 = result

        norm1, norm2 = self.normals[axis1], obb.normals[axis2]
        resolve_vec1, resolve_vec2 = scaled_to_length(norm1, penetration1/2), scaled_to_length(norm2, penetration2/2)

        self.set_center(add_vecs(self.center, resolve_vec1))
        obb.set_center(add_vecs(obb.center, resolve_vec2))
        return resolve_vec1, resolve_vec2

    def rotate(self, increment):
        """ Rotate the OBB by "increment" radians """
        self.angle = (self.angle + increment) % TWO_PI
        self._compute_vertices()

    def set_angle(self, angle):
        """ Set the OBB's orientation to "angle" radians """
        self.angle = angle % TWO_PI
        self._compute_vertices()

    def set_center(self, center):
        """ Set the position of the OBB's center """
        self.center = list(center)
        self._compute_vertices()
