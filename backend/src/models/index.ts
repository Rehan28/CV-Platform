import { User } from "./User";
import { Attribute } from "./Attribute";
import { AttributeValue } from "./AttributeValue";
import { UserAttributeSelection } from "./UserAttributeSelection";
import { RecentlyUsedAttribute } from "./RecentlyUsedAttribute";
import { Position } from "./Position";
import { PositionAttribute } from "./PositionAttribute";
import { AccessRule } from "./AccessRule";
import { Tag } from "./Tag";
import { Project } from "./Project";
import { ProjectTag } from "./ProjectTag";
import { CV } from "./CV";
import { Like } from "./Like";
import { DiscussionPost } from "./DiscussionPost";

// Attribute <-> AttributeValue (profile master values)
Attribute.hasMany(AttributeValue, { foreignKey: "attributeId" });
AttributeValue.belongsTo(Attribute, { foreignKey: "attributeId" });
User.hasMany(AttributeValue, { foreignKey: "userId" });
AttributeValue.belongsTo(User, { foreignKey: "userId" });

// Candidate opt-in Info attributes
User.hasMany(UserAttributeSelection, { foreignKey: "userId" });
Attribute.hasMany(UserAttributeSelection, { foreignKey: "attributeId" });
UserAttributeSelection.belongsTo(User, { foreignKey: "userId" });
UserAttributeSelection.belongsTo(Attribute, { foreignKey: "attributeId" });

// Recently used
User.hasMany(RecentlyUsedAttribute, { foreignKey: "userId" });
RecentlyUsedAttribute.belongsTo(Attribute, { foreignKey: "attributeId" });

// Position <-> Attribute (template composition)
Position.belongsToMany(Attribute, { through: PositionAttribute, foreignKey: "positionId" });
Attribute.belongsToMany(Position, { through: PositionAttribute, foreignKey: "attributeId" });
Position.hasMany(PositionAttribute, { foreignKey: "positionId" });
PositionAttribute.belongsTo(Attribute, { foreignKey: "attributeId" });

// Access rules
Position.hasMany(AccessRule, { foreignKey: "positionId", onDelete: "CASCADE" });
AccessRule.belongsTo(Attribute, { foreignKey: "attributeId" });
AccessRule.belongsTo(Position, { foreignKey: "positionId" });

// Position ownership (createdBy is "last modified by" since positions are shared)
Position.belongsTo(User, { as: "createdBy", foreignKey: "createdById" });

// Projects + tags
User.hasMany(Project, { foreignKey: "userId" });
Project.belongsTo(User, { foreignKey: "userId" });
Project.belongsToMany(Tag, { through: ProjectTag, foreignKey: "projectId" });
Tag.belongsToMany(Project, { through: ProjectTag, foreignKey: "tagId" });

// CVs
User.hasMany(CV, { foreignKey: "userId" });
CV.belongsTo(User, { foreignKey: "userId" });
Position.hasMany(CV, { foreignKey: "positionId" });
CV.belongsTo(Position, { foreignKey: "positionId" });

// Likes
CV.hasMany(Like, { foreignKey: "cvId", onDelete: "CASCADE" });
Like.belongsTo(CV, { foreignKey: "cvId" });
User.hasMany(Like, { foreignKey: "recruiterId" });

// Discussions
Position.hasMany(DiscussionPost, { foreignKey: "positionId", onDelete: "CASCADE" });
DiscussionPost.belongsTo(Position, { foreignKey: "positionId" });
DiscussionPost.belongsTo(User, { as: "author", foreignKey: "authorId" });

export {
  User,
  Attribute,
  AttributeValue,
  UserAttributeSelection,
  RecentlyUsedAttribute,
  Position,
  PositionAttribute,
  AccessRule,
  Tag,
  Project,
  ProjectTag,
  CV,
  Like,
  DiscussionPost,
};
